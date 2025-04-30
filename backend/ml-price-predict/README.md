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

## Running the Docker Container

To run the Docker container for the `ml-price-predict` service, follow these steps:

### 1. Build the Docker Image
Navigate to the directory containing the `Dockerfile` and run the following command to build the Docker image:
```bash
docker build -t uberclone-ml-price-predict .
```
- `-t uberclone-ml-price-predict`: Tags the image with the name `uberclone-ml-price-predict`.
- `.`: Specifies the current directory as the build context.

### 2. Run the Docker Container
Start the container in detached mode with the following command:
```bash
docker run -d -p 8000:8000 --name uberclone-ml-price-predict uberclone-ml-price-predict
```
- `-d`: Runs the container in detached mode (in the background).
- `-p 8000:8000`: Maps port 8000 on the host to port 8000 in the container.
- `--name uberclone-ml-price-predict`: Assigns the name `uberclone-ml-price-predict` to the container.
- `uberclone-ml-price-predict`: The name of the Docker image to run.

### 3. Access the Application
Once the container is running, you can access the FastAPI application at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Stop the Container
To stop the running container, use the following command:
```bash
docker stop uberclone-ml-price-predict
```

### 5. Remove the Container
If you want to remove the container after stopping it, run:
```bash
docker rm uberclone-ml-price-predict
```