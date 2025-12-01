const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. Login to get token
const loginData = JSON.stringify({
    email: 'test@example.com', // Replace with a valid user email if needed
    password: 'password123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const uploadFile = (token) => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const filePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(filePath, 'This is a test document content.');

    const fileContent = fs.readFileSync(filePath);

    const bodyStart = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="title"',
        '',
        'Test Document',
        `--${boundary}`,
        'Content-Disposition: form-data; name="description"',
        '',
        'Test Description',
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="test-upload.txt"',
        'Content-Type: text/plain',
        '',
        ''
    ].join('\r\n');

    const bodyEnd = `\r\n--${boundary}--`;

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/documents',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(bodyStart) + fileContent.length + Buffer.byteLength(bodyEnd)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Upload Status: ${res.statusCode}`);
        res.on('data', (d) => process.stdout.write(d));

        // Cleanup
        fs.unlinkSync(filePath);
    });

    req.on('error', (e) => console.error(e));

    req.write(bodyStart);
    req.write(fileContent);
    req.write(bodyEnd);
    req.end();
};

console.log('Logging in...');
const req = http.request(loginOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        const response = JSON.parse(body);
        if (response.success) {
            console.log('Login successful. Token received.');
            uploadFile(response.data.token);
        } else {
            console.error('Login failed:', response);
            // Try registering if login fails
            registerAndUpload();
        }
    });
});

req.write(loginData);
req.end();

const registerAndUpload = () => {
    console.log('Registering new user...');
    const regData = JSON.stringify({
        name: 'Uploader',
        email: `uploader${Date.now()}@test.com`,
        password: 'password123'
    });

    const regReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': regData.length }
    }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
            const r = JSON.parse(body);
            if (r.success) {
                console.log('Registration successful.');
                uploadFile(r.data.token);
            } else {
                console.error('Registration failed:', r);
            }
        });
    });
    regReq.write(regData);
    regReq.end();
}
