import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    transports: ['websocket'],

    auth: {
        role: 'visitor',
        publicKey: '6090e1fa4e512e3820c803dd52766de2ae8998765c4b0210',
        visitorId: 'visitor_001',
    },

    extraHeaders: {
        Origin: 'https://example.com',
    },
});

socket.on('connect', () => {
    console.log('Visitor connected:', socket.id);

    socket.emit(
        'join_conversation',
        {
            conversationId: '6af6d21d491029f5757c1801',
        },
        (response) => {
            console.log('Join response:', response);
        }
    );
});

socket.on('connect_error', (error) => {
    console.log('Connection error:', error.message);
});

socket.on('new_message', (message) => {
    console.log('New message received:', message);
});