# Chatbot

This repository contains code for deploying a chatbot application using Flask.

## Setup

### Step 1: Set Execution Policy

First, you need to set the execution policy for PowerShell to allow remote signed scripts. Follow these steps:

1. Open the command prompt.

2. Run the following command:
   
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser 
   ```

   This command sets all execution policies for the current user as remotely signed. It may take a few seconds to complete.

### Step 2: Verify Execution Policy

After setting the execution policy, verify that it has been set correctly by running the following command:

   ```powershell
   Get-ExecutionPolicy
   ```

   If the output is "RemoteSigned", the execution policy has been successfully set.

### Step 3: View Execution Policy List

To view the list of execution policies and check which policy has been updated, run the following command:

   ```powershell
   Get-ExecutionPolicy -list
   ```

## Package Installation

Once you have configured the execution policy, proceed with installing the required packages for the chatbot application.

1. Clone the git repository:

    ```sh
    git clone https://github.com/adarsh966/chatbot.git
    cd chatbot
    ```

    or

    ```sh
    git clone git@github.com:adarsh966/chatbot.git
    cd chatbot
    ```

2. Create a virtual environment:

    ```sh
    python3 -m venv venv
    ```

3. Activate the virtual environment:

    ```sh
    source venv/bin/activate   # On macOS/Linux
    . venv\Scripts\activate    # On Windows
    ```

4. Install required packages:

    ```sh
    pip install Flask torch torchvision nltk pyspellchecker flask-cors
    ```

5. Download NLTK data:

    ```sh
    python   # Start the Python interpreter
    import nltk
    nltk.download('punkt')
    ```

6. Verify installation of spellchecker and flask-cors:

    ```sh
    python   # Start the Python interpreter
    import spellchecker
    import flask_cors
    ```

## Training

To train the chatbot:

```sh
python train.py
```

## Running the Application

To start the chatbot application:

```sh
python app.py
```
