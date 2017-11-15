$(()=>{
    // Initialize variables
    let $window = $(window);
    let $usernameInput = $('.usernameInput'); // Input for username
    let $messages = $('.messages'); // Messages area
    let $inputMessage = $('.inputMessage'); // Input in message input box

    let $loginPage = $('.login.page'); // The login page
    let $chatPage = $('.chat.page'); // The chat-room page

    let username
        , connected = false // To keep save the login state of the user
        , typing = false
        , lastTypingTime
        , $currentInput = $usernameInput.focus();


    let socket = io();

    // Sets the client's username
    function setUsername() {
        username = cleanInput($usernameInput.val().trim());

        if(username){
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();

            socket.emit('add user', username);
        }
    }

    // Log a message
    function log(message, options) {
        let $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    function addMessageElement(el, options) {
        let $el = $(el);

        // Setup default options
        if(!options){
            options = {};
        }
        
    }
    function cleanInput(input) {
        return $('<div/>').text(input).html();
    }


    // Keyboard events

    $window.keydown((event)=>{
        // Auto-focus the current input when a key is typed
        if(!(event.ctrlKey || event.metaKey || event.altKey)){
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if(event.which === 13){
            if(username){
                // TODO: config the control flow
                console.log(username);
            }else {
                setUsername();
            }
        }
    });

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('login', (data)=>{
       connected = true;
       // Display the welcome message
        let message = "Welcome to Artist-Hub Community - ";


    });
});