```text
ml-price-predict/
├── notebooks/                  # For exploration
│   └── fare_analysis.ipynb     # EDA & model prototyping
├── app/
│   ├── main.py                 # FastAPI app
│   ├── api/
│   │   └── predict.py          # Combined endpoints & models
│   ├── ml/                     # ML-specific code
│   │   ├── model.py            # Trained model (pickle/ONNX)
│   │   ├── preprocessor.py     # Feature engineering
│   │   └── train.py            # Training script
│   └── config.py               # Single config file
├── data/                       # Dataset management
│   ├── raw/                    # Original Kaggle data
│   └── processed/              # Cleaned/preprocessed
├── tests/                      # Basic smoke tests
│   └── test_predict.py
└── requirements.txt            # Dev + prod dependencies

```