$(document).ready(function () {
    if ('serial' in navigator) {
        let port;
        let reader;
        let textDecoder;
        let inputField;

        function reverseString(str) {
            return str.split('').reverse().join('');
        }

        async function connectSerial() {
            try {
                // Request the port and open a connection
                port = await navigator.serial.requestPort();
                await port.open({ baudRate: 9600 });

                // Initialize text decoder
                textDecoder = new TextDecoderStream();
                const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
                reader = textDecoder.readable.getReader();

                // Start reading data
                readSerialData();
            } catch (error) {
                console.log('Error:', error);
            }
        }

        async function readSerialData() {
            while (true) {
                try {
                    const { value, done } = await reader.read();
                    if (done) {
                        reader.releaseLock();
                        break;
                    }
                    // Display the data in the input field
                    let reversedValue = reverseString(value.trim());
                    let floatValue = parseFloat(reversedValue);
                    if (inputField) {
                        inputField.val(floatValue);
                    }
                } catch (error) {
                    console.log('Error reading data:', error);
                    break;
                }
            }
        }

        async function closePort() {
            if (port && port.opened) {
                await port.close();
            }
        }

        // Connect to the serial port when the form loads
        connectSerial();

        // Handle focusing and closing the port after 3 seconds
        $(document).on('focus', 'input[data-fieldname="quantity"]', function () {
            inputField = $(this);

            // Focus on the input field after 3 seconds
            setTimeout(() => {
                if (inputField) {
                    inputField.focus();
                    closePort();
                }
            }, 3000);
        });

        // Optionally, you can close the port when the form is submitted or when you no longer need it
        // $(document).on('submit', 'form', function () {
        //     closePort();
        // });

    } else {
        console.log('Web Serial API is not supported in this browser.');
    }
});
