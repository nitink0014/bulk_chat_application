
import { io } from 'socket.io-client';


const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    reconnection: false,
    extraHeaders: {
        Cookie:'bulkchat_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZjZiOGMzZWQzN2MyZWVmNjFmNjM0ZiIsImlhdCI6MTc5NDU2MTQzNiwiZXhwIjoxNzk1MTY2MjM2fQ.LyZWpdKwUOelbx-ZmKMNRXGLTQbps6k87lfKtYFSE1I',
    },
});


socket.on('connect', () => {
    console.log('Agent connected:', socket.id);

    socket.emit(
        'join_conversation',
        {
            conversationId: '6af6d21d491029f5757c1801',
        },
        (response) => {
            console.log('Join response:', response);

            if (response.success) {
                socket.emit(
                    'send_message',
                    {
                        conversationId: '6af6d21d491029f5757c1801',
                        content: 'Hello! This is my first real-time message.',
                    },
                    (messageResponse) => {
                        console.log('Message response:', messageResponse);
                    }
                );
            }
        }
    );
});

socket.on('new_message', (message) => {
    console.log('New message received:', message);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
});

