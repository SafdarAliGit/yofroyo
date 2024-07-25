$(document).ready(function () {
    if ('serial' in navigator) {
        let port;
        let reader;
        let textDecoder;

        function reverseString(str) {
            return str.split('').reverse().join('');
        }

        async function connectSerial() {
            try {
                // Request the port and open a connection
                port = await navigator.serial.requestPort();
                await port.open({baudRate: 9600});

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
                    const {value, done} = await reader.read();
                    if (done) {
                        reader.releaseLock();
                        break;
                    }
                    // Display the data in the input field
                    let reversedValue = reverseString(value.trim());
                    let floatValue = parseFloat(reversedValue);
                    const inputField = $('input[data-fieldname="qty"]');
                    if (inputField.length) {
                        inputField.val(floatValue);

                        // Focus on the input field after 3 seconds
                        setTimeout(() => {
                            inputField.focus();
                        }, 3000);
                    }
                } catch (error) {
                    console.log('Error reading data:', error);
                    break;
                }
            }
        }

        $(document).on('click', '.item-name', function () {
            connectSerial();
        });
    } else {
        console.log('Web Serial API is not supported in this browser.');
    }
});
