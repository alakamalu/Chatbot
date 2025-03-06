import random
import json
import torch
from spellchecker import SpellChecker
from nltk_utils import bag_of_words, tokenize
from model import NeuralNet

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r') as json_data:
    intents = json.load(json_data)

FILE = "data.pth"
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "Mindbot"

spell = SpellChecker(language='en')

def preprocess_message(msg):
    words = []
    current_word = ''
    for char in msg:
        if char.isalpha():
            current_word += char
        else:
            if current_word:
                words.append(current_word)
                current_word = ''
    if current_word:
        words.append(current_word)
    return ' '.join(words)

def get_response(msg):
    msg = preprocess_message(msg)
    
    sentence = tokenize(msg)
    
    corrected_sentence = [spell.correction(word) for word in sentence]
    
    X = bag_of_words(corrected_sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])
    
    return "I'm sorry, I didn't quite understand that. For further assistance, please write to us at contact@mtds.in"


if __name__ == "__main__":
    print("Let's chat! (type 'quit' to exit)")
    while True:
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)
