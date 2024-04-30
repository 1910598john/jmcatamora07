<!DOCTYPE html>
<html>
<head>
    <title>Excel to MySQL Upload</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.3/xlsx.full.min.js"></script>
</head>
<body>
    <input type="file" id="fileInput" />
    <button onclick="uploadExcel()">Upload</button>

    <script>
        function uploadExcel() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('./php/upload_sss.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                console.log('Excel file uploaded successfully');
            } else {
                console.error('Failed to upload Excel file');
            }
        })
        .catch(error => {
            console.error('Error occurred while uploading Excel file:', error);
        });
    }
}
    </script>
</body>
</html>
