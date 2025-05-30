## Project Structure


frontend/

frontend/

│── src/

│ │── assets/ # image resources

│ │── components/ # Reusable UI components

│ │── hooks/ # API request logic, connect backend

│ │── App.jsx # Main application component

│ │── main.js # Entry point

│ │── ai.js # call AI API

│

│── public/ # Static assets

│── package.json # Dependencies and scripts

│── README.md # Project documentation

## Using Hugging Face API

To use the Hugging Face API, you need to sign up for an API key. 
The application interacts with Hugging Face's AI models via their inference API. The request is handled in the src/api.js file.
