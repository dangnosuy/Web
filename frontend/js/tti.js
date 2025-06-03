function TextToImage() {
    event.preventDefault();
    var username = localStorage.getItem('username')
    var prompt = document.getElementById('textInput').value
    const spinner = document.getElementById('spinner');
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
        spinner.style.display = 'none';
        if(jsonData.success === false) {
            console.log("Lỗi: " + jsonData.error)
        }
        else {
            console.log("File path: " + jsonData.result_path)
            addImageToGallery(jsonData.result_path);
        }
    })
    .catch(error => {
        spinner.style.display = 'none';
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
function getUserImages() {
    var username = localStorage.getItem('username');
    // Giả sử type của bạn là "text_to_image"
    var type = "text_to_image";

    fetch(`http://127.0.0.1:5551/api/get_data_user?username=${encodeURIComponent(username)}&type=${encodeURIComponent(type)}`, {
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
 //token theo để xác minh nó đúng
    const data = {
        username: username,
        file_path: filePath,
        type: "text_to_image"
    }
    fetch('http://127.0.0.1:5551/api/delete_data', {
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
function getAllImages() {
    const username = localStorage.getItem('username')
    const type = 'text_to_image';
    fetch(`http://127.0.0.1:5551/api/get_data_all?type=${encodeURIComponent(type)}&username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Lấy container carousel
            const carousel = document.getElementById('carousel');
            // Xóa nội dung cũ
            carousel.innerHTML = '';

            // Duyệt qua dữ liệu trả về và tạo các carousel-item
            data.tts_data.forEach(item => {
                const carouselItem = document.createElement('div');
                carouselItem.className = 'carousel-item';

                const isLiked = item.is_liked;
                const likeClass = isLiked ? 'liked' : '';
                const likedAttr = isLiked ? 'true' : 'false';

                // Tạo HTML cho carousel-item
                carouselItem.innerHTML = `
                    <img src="${item.result}" alt="Generated Image">
                    <button class="magnify-button" title="View Details"><i class="fas fa-search-plus"></i></button>
                    <div class="carousel-item-content">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold">${item.username}</span>
                            <div class="flex items-center">
                                <i class="fas fa-heart like-button ${likeClass}" data-liked="${likedAttr}" data-likes="${item.quantity_tym}" data-id="${item.id}"></i>
                                <span class="like-count ml-2 text-sm">${item.quantity_tym}</span>
                                <i class="fas fa-download download-button" title="Download"></i>
                                <i class="fas fa-share share-button" title="Share"></i>
                            </div>
                        </div>
                        <p class="text-sm truncate">Prompt: ${item.input_text}</p>
                    </div>
                `;
                carouselItem.dataset.imageData = JSON.stringify({
                    id: item.id,
                    username: item.username,
                    input_text: item.input_text,
                    result: item.result,
                    quantity_tym: item.quantity_tym
                });

                // Thêm item vào carousel
                carousel.appendChild(carouselItem);
            });

            // Cập nhật lại số lượng items và khởi động lại carousel
            const items = document.querySelectorAll('.carousel-item');
            const totalItems = items.length;
            let currentIndex = 0;
            const itemWidth = 320; // Width của item + margin
            let direction = 1;
            let autoSlideInterval;

            // Hàm chuyển slide
            function slideCarousel() {
                carousel.style.transition = 'transform 0.5s ease-in-out';
                carousel.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            }

            // Hàm bắt đầu auto-slide
            function startAutoSlide() {
                autoSlideInterval = setInterval(() => {
                    currentIndex += direction;
                    if (currentIndex >= totalItems - 1) {
                        direction = -1;
                        currentIndex = totalItems - 1;
                    } else if (currentIndex <= 0) {
                        direction = 1;
                        currentIndex = 0;
                    }
                    slideCarousel();
                }, 3000);
            }

            // Hàm dừng auto-slide
            function stopAutoSlide() {
                clearInterval(autoSlideInterval);
            }

            // Gán sự kiện cho nút Previous
            document.getElementById('prevSlide').addEventListener('click', () => {
                stopAutoSlide();
                currentIndex--;
                if (currentIndex < 0) {
                    currentIndex = 0;
                    direction = 1;
                }
                slideCarousel();
                setTimeout(startAutoSlide, 5000);
            });

            // Gán sự kiện cho nút Next
            document.getElementById('nextSlide').addEventListener('click', () => {
                stopAutoSlide();
                currentIndex++;
                if (currentIndex >= totalItems) {
                    currentIndex = totalItems - 1;
                    direction = -1;
                }
                slideCarousel();
                setTimeout(startAutoSlide, 5000);
            });

            startAutoSlide();

            // Gán sự kiện cho các nút like
            document.querySelectorAll('.like-button').forEach(button => {
                button.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    let likes = parseInt(this.getAttribute('data-likes'));

                    // Gửi yêu cầu đến endpoint /api/tym
                    fetch('http://127.0.0.1:5551/api/tym', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: username,
                            id: id,
                            product: type
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            if (data.action === 'liked') {
                                likes++;
                                this.setAttribute('data-liked', 'true');
                                this.classList.add('liked');
                            } else if (data.action === 'unliked') {
                                likes--;
                                this.setAttribute('data-liked', 'false');
                                this.classList.remove('liked');
                            }
                            this.setAttribute('data-likes', likes);
                            this.nextElementSibling.textContent = likes;
                        } else {
                            console.error('Error toggling like:', data.error);
                            alert('Failed to toggle like: ' + data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error toggling like:', error);
                        alert('Error toggling like');
                    });
                });
            });
            document.querySelectorAll('.download-button').forEach(button => {
                button.addEventListener('click', function () {
                    const carouselItem = this.closest('.carousel-item');
                    const img = carouselItem.querySelector('img');
                    const imgSrc = img.src;

                    // Tạo link tải xuống
                    const link = document.createElement('a');
                    link.href = imgSrc;
                    link.download = imgSrc.split('/').pop(); // Lấy tên file từ URL
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            });

            // Xử lý nút chia sẻ
            document.querySelectorAll('.share-button').forEach(button => {
                button.addEventListener('click', function () {
                    const carouselItem = this.closest('.carousel-item');
                    const img = carouselItem.querySelector('img');
                    const imgSrc = img.src;

                    // Tạo URL đầy đủ cho ảnh
                    const shareUrl = new URL(imgSrc, window.location.origin).href;

                    // Sao chép link vào clipboard
                    navigator.clipboard.writeText(shareUrl)
                        .then(() => {
                            alert('Link copied to clipboard!');
                        })
                        .catch(err => {
                            console.error('Error copying link:', err);
                            alert('Failed to copy link');
                        });

                    // Mở cửa sổ chia sẻ Twitter (tùy chọn)
                    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check%20out%20this%20generated%20image!`;
                    window.open(twitterUrl, '_blank', 'width=600,height=400');
                });
            });
            document.querySelectorAll('.magnify-button').forEach(button => {
                button.addEventListener('click', function () {
                    const carouselItem = this.closest('.carousel-item');
                    const imageData = JSON.parse(carouselItem.dataset.imageData);

                    // Tạo modal
                    const modal = document.createElement('div');
                    modal.className = 'modal';
                    modal.style.cssText = `
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(0, 0, 0, 0.9); z-index: 100;
                        display: flex; justify-content: center; align-items: center;
                        opacity: 0; transition: opacity 0.3s ease-in-out;
                    `;
                    setTimeout(() => modal.style.opacity = '1', 10);

                    const modalContent = document.createElement('div');
                    modalContent.style.cssText = `
                        background: #0f172a; border-radius: 12px; max-width: 900px; width: 90%;
                        height: 80vh; display: flex; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                        transform: scale(0.8); transition: transform 0.3s ease-in-out;
                    `;
                    setTimeout(() => modalContent.style.transform = 'scale(1)', 10);

                    // Phần trái (2/3): Ảnh
                    const leftPanel = document.createElement('div');
                    leftPanel.style.cssText = `
                        width: 66.67%; background: rgb(25 34 67); padding: 20px;
                        display: flex; align-items: center; justify-content: center;
                    `;
                    const modalImage = document.createElement('img');
                    modalImage.src = imageData.result;
                    modalImage.alt = 'Full Image';
                    modalImage.style.cssText = `
                        max-width: 100%; max-height: 100%; object-fit: contain;
                        border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        transition: transform 0.2s ease;
                    `;
                    modalImage.addEventListener('mouseenter', () => modalImage.style.transform = 'scale(1.02)');
                    modalImage.addEventListener('mouseleave', () => modalImage.style.transform = 'scale(1)');
                    leftPanel.appendChild(modalImage);

                    // Phần phải (1/3): Nội dung và bình luận
                    const rightPanel = document.createElement('div');
                    rightPanel.style.cssText = `
                        width: 33.33%; padding: 20px; background: #1e293b;
                        display: flex; flex-direction: column; overflow-y: auto;
                        color: #e2e8f0;
                    `;

                    const infoSection = document.createElement('div');
                    infoSection.style.cssText = `margin-bottom: 20px;`;

                    const username = document.createElement('p');
                    username.innerHTML = `<strong style="color: #c4b5fd;">${imageData.username}</strong>`;
                    username.style.cssText = `font-size: 18px; margin-bottom: 10px;`;

                    const likeSection = document.createElement('div');
                    likeSection.style.cssText = `display: flex; align-items: center; margin-bottom: 10px;`;
                    const likeButton = document.createElement('i');
                    likeButton.className = `fas fa-heart modal-like-button ${imageData.is_liked ? 'liked' : ''}`;
                    likeButton.style.cssText = `
                        color: ${imageData.is_liked ? '#a855f7' : '#64748b'}; cursor: pointer;
                        font-size: 20px; margin-right: 8px; transition: color 0.2s ease, transform 0.2s ease;
                    `;
                    likeButton.dataset.id = imageData.id;
                    likeButton.dataset.likes = imageData.quantity_tym;
                    likeButton.dataset.liked = imageData.is_liked ? 'true' : 'false';
                    likeButton.addEventListener('mouseenter', () => likeButton.style.transform = 'scale(1.2)');
                    likeButton.addEventListener('mouseleave', () => likeButton.style.transform = 'scale(1)');
                    const likeCount = document.createElement('span');
                    likeCount.className = 'modal-likes';
                    likeCount.textContent = imageData.quantity_tym;
                    likeCount.style.cssText = `color: #e2e8f0; font-size: 16px;`;
                    likeSection.appendChild(likeButton);
                    likeSection.appendChild(likeCount);

                    const buttonsSection = document.createElement('div');
                    buttonsSection.style.cssText = `display: flex; gap: 10px; margin-bottom: 15px;`;
                    const downloadButton = document.createElement('button');
                    downloadButton.innerHTML = '<i class="fas fa-download"></i> Download';
                    downloadButton.style.cssText = `
                        background:rgb(54, 236, 81); color: #e2e8f0; padding: 8px 12px; border: none;
                        border-radius: 6px; cursor: pointer; font-size: 14px;
                        transition: background 0.2s ease, transform 0.2s ease;
                    `;
                    downloadButton.addEventListener('mouseenter', () => {
                        downloadButton.style.background = '#a855f7';
                        downloadButton.style.transform = 'scale(1.05)';
                    });
                    downloadButton.addEventListener('mouseleave', () => {
                        downloadButton.style.background = '#7e22ce';
                        downloadButton.style.transform = 'scale(1)';
                    });
                    const shareButton = document.createElement('button');
                    shareButton.innerHTML = '<i class="fas fa-share"></i> Share';
                    shareButton.style.cssText = `
                        background:rgb(64, 203, 127); color: #e2e8f0; padding: 8px 12px; border: none;
                        border-radius: 6px; cursor: pointer; font-size: 14px;
                        transition: background 0.2s ease, transform 0.2s ease;
                    `;
                    shareButton.addEventListener('mouseenter', () => {
                        shareButton.style.background = '#a855f7';
                        shareButton.style.transform = 'scale(1.05)';
                    });
                    shareButton.addEventListener('mouseleave', () => {
                        shareButton.style.background = '#6b21a8';
                        shareButton.style.transform = 'scale(1)';
                    });
                    buttonsSection.appendChild(downloadButton);
                    buttonsSection.appendChild(shareButton);

                    const prompt = document.createElement('p');
                    prompt.innerHTML = `<strong style="color: #c4b5fd;">Prompt:</strong> ${imageData.input_text}`;
                    prompt.style.cssText = `
                        background:rgb(25, 42, 83); padding: 10px; border-radius: 6px;
                        font-size: 14px; color: #e2e8f0; line-height: 1.5; margin-bottom: 20px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    `;

                    infoSection.appendChild(username);
                    infoSection.appendChild(likeSection);
                    infoSection.appendChild(buttonsSection);
                    infoSection.appendChild(prompt);

                    // Phần bình luận
                    const commentsSection = document.createElement('div');
                    commentsSection.style.cssText = `flex-grow: 1; overflow-y: auto; margin-bottom: 20px;`;
                    const commentsTitle = document.createElement('h3');
                    commentsTitle.textContent = 'Comments';
                    commentsTitle.style.cssText = `color: #c4b5fd; font-size: 16px; margin-bottom: 10px;`;
                    const commentsList = document.createElement('div');
                    commentsList.className = 'comments-list';
                    commentsList.style.cssText = `max-height: 200px; overflow-y: auto;`;

                    fetch(`http://127.0.0.1:5551/api/get_comments?id=${imageData.id}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.success && data.comments.length > 0) {
                                data.comments.forEach(comment => {
                                    const commentItem = document.createElement('p');
                                    commentItem.innerHTML = `<strong style="color: #c4b5fd;">${comment.username}</strong>: ${comment.comment}`;
                                    commentItem.style.cssText = `
                                        background: #334155; padding: 8px; border-radius: 6px;
                                        margin-bottom: 8px; font-size: 14px; color: #e2e8f0;
                                        transition: background 0.2s ease;
                                    `;
                                    commentItem.addEventListener('mouseenter', () => commentItem.style.background = '#4 st: 0px; transition: background 0.2s ease');
                                    commentItem.addEventListener('mouseleave', () => commentItem.style.background = '#334155');
                                    commentsList.appendChild(commentItem);
                                });
                            } else {
                                commentsList.innerHTML = `<p style="color: #64748b;">No comments yet</p>`;
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching comments:', error);
                            commentsList.innerHTML = `<p style="color: #64748b;">Failed to load comments</p>`;
                        });

                    commentsSection.appendChild(commentsTitle);
                    commentsSection.appendChild(commentsList);

                    const commentForm = document.createElement('div');
                    commentForm.style.cssText = `display: flex; gap: 10px;`;
                    const commentInput = document.createElement('input');
                    commentInput.type = 'text';
                    commentInput.placeholder = 'Add a comment...';
                    commentInput.style.cssText = `
                        flex-grow: 1; padding: 8px; border: 1px solid #4b5563;
                        border-radius: 6px; font-size: 14px; background: #1e293b; color: #e2e8f0;
                        transition: border-color 0.2s ease;
                    `;
                    commentInput.addEventListener('focus', () => commentInput.style.borderColor = '#a855f7');
                    commentInput.addEventListener('blur', () => commentInput.style.borderColor = '#4b5563');
                    const commentButton = document.createElement('button');
                    commentButton.textContent = 'Post';
                    commentButton.disabled = true;
                    commentButton.style.cssText = `
                        background: #7e22ce; color: #e2e8f0; padding: 8px 12px; border: none;
                        border-radius: 6px; cursor: pointer; font-size: 14px; opacity: 0.5;
                        transition: background 0.2s ease, transform 0.2s ease;
                    `;
                    commentButton.addEventListener('mouseenter', () => {
                        if (!commentButton.disabled) {
                            commentButton.style.background = '#a855f7';
                            commentButton.style.transform = 'scale(1.05)';
                        }
                    });
                    commentButton.addEventListener('mouseleave', () => {
                        commentButton.style.background = '#7e22ce';
                        commentButton.style.transform = 'scale(1)';
                    });
                    commentForm.appendChild(commentInput);
                    commentForm.appendChild(commentButton);

                    rightPanel.appendChild(infoSection);
                    rightPanel.appendChild(commentsSection);
                    rightPanel.appendChild(commentForm);

                    const closeButton = document.createElement('span');
                    closeButton.textContent = '×';
                    closeButton.style.cssText = `
                        position: absolute; top: 10px; right: 10px; font-size: 24px;
                        color: #e2e8f0; cursor: pointer; z-index: 10;
                        transition: color 0.2s ease, transform 0.2s ease;
                    `;
                    closeButton.addEventListener('mouseenter', () => closeButton.style.transform = 'scale(1.2)');
                    closeButton.addEventListener('mouseleave', () => closeButton.style.transform = 'scale(1)');

                    modalContent.appendChild(leftPanel);
                    modalContent.appendChild(rightPanel);
                    modalContent.appendChild(closeButton);
                    modal.appendChild(modalContent);
                    document.body.appendChild(modal);

                    stopAutoSlide();

                    likeButton.addEventListener('click', function () {
                        const id = this.dataset.id;
                        let likes = parseInt(this.dataset.likes);

                        fetch('http://127.0.0.1:5551/api/tym', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, id, product: type })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                if (data.action === 'liked') {
                                    likes++;
                                    this.dataset.liked = 'true';
                                    this.style.color = '#a855f7';
                                } else {
                                    likes--;
                                    this.dataset.liked = 'false';
                                    this.style.color = '#64748b';
                                }
                                this.dataset.likes = likes;
                                likeCount.textContent = likes;

                                const carouselLikeButton = document.querySelector(`.like-button[data-id="${id}"]`);
                                if (carouselLikeButton) {
                                    carouselLikeButton.setAttribute('data-likes', likes);
                                    carouselLikeButton.classList.toggle('liked', data.action === 'liked');
                                    carouselLikeButton.nextElementSibling.textContent = likes;
                                }
                            } else {
                                alert('Failed to toggle like: ' + data.error);
                            }
                        })
                        .catch(error => {
                            console.error('Error toggling like:', error);
                            alert('Error toggling like');
                        });
                    });

                    downloadButton.addEventListener('click', () => {
                        const link = document.createElement('a');
                        link.href = imageData.result;
                        link.download = imageData.result.split('/').pop();
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });

                    shareButton.addEventListener('click', () => {
                        const shareUrl = new URL(imageData.result, window.location.origin).href;
                        navigator.clipboard.writeText(shareUrl)
                            .then(() => alert('Link copied to clipboard!'))
                            .catch(err => alert('Failed to copy link'));
                        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check%20out%20this%20generated%20image!`;
                        window.open(twitterUrl, '_blank', 'width=600,height=400');
                    });

                    commentInput.addEventListener('input', () => {
                        commentButton.disabled = commentInput.value.trim() === '';
                        commentButton.style.opacity = commentInput.value.trim() === '' ? '0.5' : '1';
                    });

                    commentButton.addEventListener('click', () => {
                        const comment = commentInput.value.trim();
                        if (comment) {
                            fetch('http://127.0.0.1:5551/api/add_comment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ imageId: imageData.id, username, comment })
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    const commentItem = document.createElement('p');
                                    commentItem.innerHTML = `<strong style="color: #c4b5fd;">${data.comment.username}</strong>: ${data.comment.comment}`;
                                    commentItem.style.cssText = `
                                        background: #334155; padding: 8px; border-radius: 6px;
                                        margin-bottom: 8px; font-size: 14px; color: #e2e8f0;
                                        transition: background 0.2s ease;
                                    `;
                                    commentItem.addEventListener('mouseenter', () => commentItem.style.background = '#4b5563');
                                    commentItem.addEventListener('mouseleave', () => commentItem.style.background = '#334155');
                                    commentsList.appendChild(commentItem);
                                    commentInput.value = '';
                                    commentButton.disabled = true;
                                    commentButton.style.opacity = '0.5';
                                    if (commentsList.textContent === 'No comments yet') {
                                        commentsList.innerHTML = '';
                                    }
                                } else {
                                    alert('Failed to post comment: ' + data.error);
                                }
                            })
                            .catch(error => {
                                console.error('Error posting comment:', error);
                                alert('Error posting comment');
                            });
                        }
                    });

                    closeButton.addEventListener('click', () => {
                        modal.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(modal);
                            startAutoSlide();
                        }, 300);
                    });

                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.style.opacity = '0';
                            setTimeout(() => {
                                document.body.removeChild(modal);
                                startAutoSlide();
                            }, 300);
                        }
                    });
                });
            });
        } else {
            console.error('Error fetching data:', data.error);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}
