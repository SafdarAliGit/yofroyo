$(document).ready(function () {
    if ('serial' in navigator) {
        let port;
        let reader;
        let textDecoder;

        // Function to connect to the serial port
        async function connectSerial() {
            try {
                console.log('Requesting serial port...');
                port = await navigator.serial.requestPort();
                await port.open({ baudRate: 9600 });

                console.log('Serial port opened successfully.');

                // Initialize text decoder
                textDecoder = new TextDecoderStream();
                const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
                reader = textDecoder.readable.getReader();

                // Start reading data
                readSerialData();
            } catch (error) {
                console.error('Error connecting to serial port:', error);
            }
        }

        // Function to read data from the serial port
        async function readSerialData() {
            while (true) {
                try {
                    const { value, done } = await reader.read();
                    if (done) {
                        reader.releaseLock();
                        console.log('Reader is done.');
                        break;
                    }

                    console.log('Received data:', value);

                    // Process the received data
                    let floatValue = parseFloat(value.trim());
                    const inputField = $('#quantity');

                    if (inputField.length) {
                        inputField.val(floatValue);
                        console.log('Updated input field with value:', floatValue);

                        // Focus on the input field after 3 seconds
                        setTimeout(() => {
                            inputField.focus();
                            console.log('Focused on input field.');
                        }, 3000);
                    } else {
                        console.error('Input field with data-fieldname="quantity" not found.');
                    }
                } catch (error) {
                    console.error('Error reading serial data:', error);
                    break;
                }
            }
        }

        // Bind click event to the button to start the serial connection
        $(document).on('click', '#quantity', function () {
            connectSerial();
        });
    } else {
        console.error('Web Serial API is not supported in this browser.');
    }
});
