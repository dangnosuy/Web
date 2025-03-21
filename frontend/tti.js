function TextToImage() {
    event.preventDefault();
    var username = localStorage.getItem('username')
    var prompt = document.getElementById('textInput').value

    var style = document.getElementById('style').value
    prompt = prompt + " with style " + style;

    var data = {
        username : username,
        prompt : prompt
    }
    console.log(data)
    fetch('http://127.0.0.1:5551/api/texttoimage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)

    })
    .then(response => response.json())
    .then(jsonData  => {
        console.log(jsonData);
        if(jsonData.success === false) {
            console.log("Lỗi: " + jsonData.error)
        }
        else {
            console.log("File path: " + jsonData.result_path)
            addImageToGallery(jsonData.result_path);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    }) 
}

// Hàm thêm ảnh vào gallery
function addImageToGallery(filePath) {
    // Lấy phần tử gallery
    const gallery = document.getElementById('gallery');
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';

    // Tạo thẻ img và đặt thuộc tính src là file path nhận được từ backend
    const img = document.createElement('img');
    img.src = filePath;
    img.alt = "Generated Image";

    // Tạo container cho các nút action
    const imageActions = document.createElement('div');
    imageActions.className = 'image-actions';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-image';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteButton.addEventListener('click', function() {
        if (confirm("Bạn có chắc chắn muốn xóa ảnh này không?")) {
            deleteImage(filePath, imageItem);
        }
    });
    // Tạo nút Save
    const downloadButton = document.createElement('button');
    downloadButton.className = 'download-image';
    downloadButton.innerHTML = '<i class="fas fa-download"></i> Save';
    // Bạn có thể thêm xử lý cho nút download tại đây
    downloadButton.addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = filePath;
        link.download = filePath.split('/').pop(); // Lấy tên file từ đường dẫn
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Xóa thẻ <a> sau khi tải
    });
    // Tạo nút Share
    const shareButton = document.createElement('button');
    shareButton.className = 'share-image';
    shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Share';
    // Bạn có thể thêm xử lý cho nút share tại đây

    // Gắn các nút vào container
    imageActions.appendChild(downloadButton);
    imageActions.appendChild(shareButton);
    imageActions.appendChild(deleteButton);
    // Gắn ảnh và các nút vào image item
    imageItem.appendChild(img);
    imageItem.appendChild(imageActions);

    // Thêm image item mới vào gallery
    gallery.appendChild(imageItem);
}
function getAllImages() {
    var username = localStorage.getItem('username');
    // Giả sử type của bạn là "text_to_image"
    var type = "text_to_image";

    fetch(`http://127.0.0.1:5551/api/get_tti_data?username=${encodeURIComponent(username)}&type=${encodeURIComponent(type)}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(jsonData => {
        console.log("Get tts_data response:", jsonData);
        if (!jsonData.success) {
            console.error("Error fetching image history:", jsonData.error);
            return;
        }
        // Xóa nội dung cũ trong gallery nếu cần
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = "";
        // Duyệt qua danh sách đường dẫn và thêm từng ảnh
        jsonData.tts_data.forEach(filePath => {
            addImageToGallery(filePath);
        });
    })
    .catch(error => {
        console.error("Error fetching history:", error);
    });
}
function deleteImage(filePath, imageItem) {
    const username = localStorage.getItem('username')
    const data = {
        username: username,
        file_path: filePath,
        type: "text_to_image"
    }

    fetch('http://127.0.0.1:5550/api/delete_data', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(jsonData => {
        if (jsonData.success) {
            imageItem.remove();
        }
        else {
            console.log("Error: ", jsonData.error)
        }
    })
    .catch(error => {
        console.error('Error: ', error);
    })
}
