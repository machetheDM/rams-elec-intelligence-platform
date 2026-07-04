"""
XGBoost Quote Estimator — Model Training Script

Trains on Gold layer data from PostgreSQL.
Tracks experiments with MLflow.
Saves model + SHAP explainer for the triage API.

Run: python train_model.py
"""

import os
import pickle
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import mlflow
import mlflow.xgboost

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("train_model")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ramsatelec")
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "sqlite:///mlflow.db")

MODEL_DIR = Path(__file__).parent / "model"
MODEL_DIR.mkdir(exist_ok=True)

FEATURE_COLS = [
    "service_category_encoded",
    "urgency_flag",
    "area_zone_encoded",
    "equipment_age_years",
    "month",
    "day_of_week",
    "is_weekend",
]

CATEGORY_MAP = {
    "electrical": 0, "refrigeration": 1, "emergency": 2,
    "maintenance": 3, "installation": 4, "general": 5,
}
ZONE_MAP = {
    "Sandton": 0, "Midrand": 1, "Centurion": 2, "Pretoria East": 3,
    "Soweto": 4, "Polokwane": 5, "Mokopane": 6, "Bela-Bela": 7,
}


def load_training_data() -> pd.DataFrame:
    """Load Gold layer data from PostgreSQL."""
    engine = create_engine(DATABASE_URL)

    # Try gold_jobs table first
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM gold_jobs WHERE actual_cost IS NOT NULL"))
            rows = result.fetchall()
        if rows:
            columns = result.keys()
            df = pd.DataFrame(rows, columns=columns)
            logger.info(f"Loaded {len(df)} rows from gold_jobs table")
            return df
    except Exception:
        logger.info("gold_jobs not available — falling back to jobs table")

    # Fallback: query jobs + derive features manually
    logger.info("gold_jobs table empty — building features from jobs table")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                j.id, j.status, j.urgency, j.area_zone, j.actual_cost, j.quoted_cost,
                j.scheduled_date, j.completed_date, j.created_at,
                st.category as service_category,
                e.install_date
            FROM jobs j
            JOIN service_types st ON j.service_type_id = st.id
            LEFT JOIN equipment e ON j.equipment_id = e.id
            WHERE j.status = 'complete' AND j.actual_cost IS NOT NULL
        """))
        rows = result.fetchall()

    if not rows:
        logger.error("No training data available. Run the seed script first.")
        return pd.DataFrame()

    columns = result.keys()
    df = pd.DataFrame(rows, columns=columns)

    # Feature engineering
    df["service_category_encoded"] = df["service_category"].map(CATEGORY_MAP).fillna(5).astype(int)
    df["urgency_flag"] = df["urgency"].isin(["emergency", "high"]).astype(int)
    df["area_zone_encoded"] = df["area_zone"].map(ZONE_MAP).fillna(0).astype(int)

    df["scheduled_date"] = pd.to_datetime(df["scheduled_date"], errors="coerce")
    df["completed_date"] = pd.to_datetime(df["completed_date"], errors="coerce")
    df["install_date"] = pd.to_datetime(df["install_date"], errors="coerce")

    df["month"] = df["scheduled_date"].dt.month.fillna(6).astype(int)
    df["day_of_week"] = df["scheduled_date"].dt.dayofweek.fillna(2).astype(int)
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

    df["equipment_age_years"] = (
        (df["scheduled_date"] - df["install_date"]).dt.days / 365.25
    ).fillna(0).clip(0, 50)

    logger.info(f"Built {len(df)} training records from jobs table")
    return df


def train():
    """Train XGBoost model with MLflow tracking."""
    df = load_training_data()
    if df.empty:
        logger.error("No training data. Aborting.")
        return

    # Prepare features and target
    X = df[FEATURE_COLS].fillna(0)
    y = df["actual_cost"].clip(lower=0)

    logger.info(f"Training data: {X.shape[0]} samples, {X.shape[1]} features")
    logger.info(f"Target range: R{y.min():,.2f} – R{y.max():,.2f}, mean: R{y.mean():,.2f}")

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Set up MLflow
    mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
    mlflow.set_experiment("rams_elec_quote_estimator")

    with mlflow.start_run(run_name=f"xgb_v1_{pd.Timestamp.now().strftime('%Y%m%d_%H%M')}"):
        # Model parameters
        params = {
            "n_estimators": 200,
            "max_depth": 6,
            "learning_rate": 0.05,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
            "min_child_weight": 3,
            "reg_alpha": 0.1,
            "reg_lambda": 1.0,
            "objective": "reg:squarederror",
            "random_state": 42,
        }

        model = xgb.XGBRegressor(**params)
        model.fit(X_train, y_train)

        # Predictions
        y_pred = model.predict(X_test)

        # Metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        # Cross-validation
        cv_scores = cross_val_score(model, X, y, cv=5, scoring="neg_mean_absolute_error")
        cv_mae = -cv_scores.mean()

        logger.info(f"MAE:  R{mae:,.2f}")
        logger.info(f"RMSE: R{rmse:,.2f}")
        logger.info(f"R²:   {r2:.4f}")
        logger.info(f"CV MAE (5-fold): R{cv_mae:,.2f}")

        # Log to MLflow
        mlflow.log_params(params)
        mlflow.log_metrics({
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "cv_mae": cv_mae,
        })
        mlflow.xgboost.log_model(model, "model")

        # Feature importance
        importance = model.get_booster().get_score(importance_type="gain")
        logger.info("Feature importance (gain):")
        for feat, score in sorted(importance.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"  {feat}: {score:.1f}")

        # Save model for API
        model_path = MODEL_DIR / "xgb_quote_estimator.pkl"
        model.save_model(str(model_path))
        logger.info(f"Model saved to {model_path}")

        # Save feature columns
        with open(MODEL_DIR / "feature_columns.pkl", "wb") as f:
            pickle.dump(FEATURE_COLS, f)

        # Save category maps
        with open(MODEL_DIR / "category_map.pkl", "wb") as f:
            pickle.dump(CATEGORY_MAP, f)
        with open(MODEL_DIR / "zone_map.pkl", "wb") as f:
            pickle.dump(ZONE_MAP, f)

        # Generate SHAP explainer
        try:
            import shap
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X_test[:100])

            # Save SHAP explainer
            with open(MODEL_DIR / "shap_explainer.pkl", "wb") as f:
                pickle.dump(explainer, f)
            logger.info("SHAP explainer saved")

            # Log SHAP summary to MLflow
            import matplotlib.pyplot as plt
            fig, ax = plt.subplots(figsize=(10, 6))
            shap.summary_plot(shap_values, X_test[:100], feature_names=FEATURE_COLS, show=False)
            mlflow.log_figure(fig, "shap_summary.png")
            plt.close()
            logger.info("SHAP summary logged to MLflow")
        except Exception as e:
            logger.warning(f"SHAP generation failed (non-blocking): {e}")

    logger.info("Training complete!")

    # Print summary for README
    print("\n" + "=" * 60)
    print("XGBoost Quote Estimator — Training Summary")
    print("=" * 60)
    print(f"Training samples:  {len(X_train)}")
    print(f"Test samples:      {len(X_test)}")
    print(f"Features:          {FEATURE_COLS}")
    print(f"MAE:               R{mae:,.2f}")
    print(f"RMSE:              R{rmse:,.2f}")
    print(f"R²:                {r2:.4f}")
    print(f"CV MAE (5-fold):   R{cv_mae:,.2f}")
    print(f"Model saved to:    {model_path}")
    print("=" * 60)


if __name__ == "__main__":
    train()
