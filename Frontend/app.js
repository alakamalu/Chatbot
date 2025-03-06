class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            micButton: document.querySelector('.mic__button'),
            speechRecognition: new webkitSpeechRecognition(),
            synth: window.speechSynthesis
        }

        this.state = false;
        this.messages = [];

        this.isListening = false;

        this.responseTimer = null;

        this.args.speechRecognition.lang = 'en-US';
        this.args.speechRecognition.interimResults = false;
        this.args.speechRecognition.continuous = true;
        this.args.speechRecognition.maxAlternatives = 1;

        window.speechSynthesis.onvoiceschanged = () => {
            this.voices = window.speechSynthesis.getVoices();
        };
    }

    display() {
        const { openButton, chatBox, sendButton, micButton, speechRecognition } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox));

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        micButton.addEventListener('click', () => {
            if (!this.isListening) {
                this.startVoiceRecognition(speechRecognition);
            } else {
                this.stopVoiceRecognition(speechRecognition);
            }
        });

        const inputField = chatBox.querySelector('.chatbox__footer input');
        inputField.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;

        if (this.state) {
            chatbox.classList.add('chatbox--active');
            const inputField = chatbox.querySelector('.chatbox__footer input');
            inputField.focus();
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    startVoiceRecognition(recognition) {
        recognition.start();
        this.isListening = true;

        recognition.onresult = (event) => {
            clearTimeout(this.responseTimer);

            const transcript = event.results[0][0].transcript;
            this.onVoiceInput(transcript);

            this.responseTimer = setTimeout(() => {
                this.stopVoiceRecognition(recognition);
            }, 3000);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    stopVoiceRecognition(recognition) {
        recognition.stop();
        this.isListening = false;
        clearTimeout(this.responseTimer);
    }

    onVoiceInput(transcript) {
        if (this.isListening) {
            this.sendInputToBackend(transcript, true);
        }
    }

    onSendButton(chatbox) {
        const inputField = chatbox.querySelector('.chatbox__footer input');
        const text = inputField.value.trim();
        if (text === "") {
            return;
        }

        this.sendInputToBackend(text, false);
        inputField.value = '';
    }

    sendInputToBackend(input, isVoiceInput) {
        const msg = { name: "User", message: input };
        this.messages.push(msg);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: input }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(response => response.json())
            .then(response => {
                const msg = { name: "Mindbot", message: response.answer };
                this.messages.push(msg);
                this.updateChatText();
                if (isVoiceInput) {
                    this.speakResponse(response.answer);
                }
            }).catch((error) => {
                console.error('Error:', error);
                this.updateChatText();
            });
    }

    speakResponse(response) {
        const utterance = new SpeechSynthesisUtterance(response);
        
        let voices = window.speechSynthesis.getVoices();
        
        let selectedVoice = voices.find(voice => voice.name === 'Google UK English Female');
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        this.args.synth.speak(utterance);
    }


    updateChatText() {
        let html = '';
        this.messages.slice().reverse().forEach(item => {
            html += `<div class="messages__item ${item.name === "Mindbot" ? 'messages__item--visitor' : 'messages__item--operator'}">${item.message}</div>`;
        });

        const chatmessage = document.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
chatbox.display();

function toggleIcons() {
    var messageInput = document.getElementById("messageInput");
    var sendButton = document.getElementById("sendButton");
    var micButton = document.getElementById("micButton");

    if (messageInput.value.trim() !== "") {
        sendButton.style.display = "inline-block";
        micButton.style.display = "none";
    } else {
        sendButton.style.display = "none";
        micButton.style.display = "inline-block";
    }
}
