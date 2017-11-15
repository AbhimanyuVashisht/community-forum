$(()=>{
    let FADE_TIME = 150; // ms


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

    function addParticipantMessage(data) {
        let message = '';
        if(data.numUsers === 1){
            message += "there's 1 participant";
        }else{
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    }

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


    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement(el, options) {
        let $el = $(el);

        // Setup default options
        if(!options){
            options = {};
        }
        if(typeof options.fade === 'undefined'){
            options.fade = true;
        }
        if(typeof options.prepend === 'undefined'){
            options.prepend = false;
        }

        // Apply options
        if(options.fade){
            $el.hide().fadeIn(FADE_TIME);
        }
        if(options.prepend){
            $messages.prepend($el);
        }else{
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }
    // Prevent input from having injected markup
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
        log(message, {
            prepend: true
        });
        addParticipantMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', (data)=>{
        log(data.username + ' joined');
        addParticipantMessage(data);
    })
});