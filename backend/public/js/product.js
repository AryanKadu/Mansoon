// // Product Page JavaScript Functionality

// document.addEventListener('DOMContentLoaded', function() {
    
//     // // Multiple Images Gallery Functionality
//     // let currentImageIndex = 0;
//     // const productImages = [
//     //     // Add your product images here - example:
//     //     '/product_images/apple2.jpg',
//     //     '/product_images/image2.jpg',
//     //     '/product_images/image3.jpg',
//     //     '/product_images/image4.jpg'
//     // ];

//     // // Initialize image gallery if multiple images exist
//     // function initializeImageGallery() {
//     //     const imageContainer = document.querySelector('.col-md-5');
//     //     const existingImage = imageContainer.querySelector('.spi');
        
//     //     if (productImages.length > 1 && existingImage) {
//     //         // Create new gallery structure
//     //         const galleryHTML = `
//     //             <div class="product-image-container">
//     //                 <img class="main-product-image" src="${productImages[0]}" alt="Product Image">
//     //                 <button class="image-nav prev" onclick="changeImage(-1)">‹</button>
//     //                 <button class="image-nav next" onclick="changeImage(1)">›</button>
//     //             </div>
//     //             <div class="product-thumbnails">
//     //                 ${productImages.map((img, index) => `
//     //                     <div class="thumbnail-item ${index === 0 ? 'active' : ''}" onclick="setMainImage(${index})">
//     //                         <img src="${img}" alt="Thumbnail ${index + 1}">
//     //                     </div>
//     //                 `).join('')}
//     //             </div>
//     //         `;
            
//     //         // Replace existing image with gallery
//     //         existingImage.parentNode.innerHTML = galleryHTML;
//     //     }
//     // }

//     // // Change main image function
//     // window.changeImage = function(direction) {
//     //     currentImageIndex += direction;
        
//     //     if (currentImageIndex >= productImages.length) {
//     //         currentImageIndex = 0;
//     //     } else if (currentImageIndex < 0) {
//     //         currentImageIndex = productImages.length - 1;
//     //     }
        
//     //     updateMainImage();
//     // };

//     // // Set main image function
//     // window.setMainImage = function(index) {
//     //     currentImageIndex = index;
//     //     updateMainImage();
//     // };

//     // // Update main image and thumbnails
//     // function updateMainImage() {
//     //     const mainImage = document.querySelector('.main-product-image');
//     //     const thumbnails = document.querySelectorAll('.thumbnail-item');
        
//     //     if (mainImage) {
//     //         mainImage.src = productImages[currentImageIndex];
            
//     //         // Update active thumbnail
//     //         thumbnails.forEach((thumb, index) => {
//     //             thumb.classList.toggle('active', index === currentImageIndex);
//     //         });
//     //     }
//     // }

//     // Add to Cart Alert Functionality
//     function showAddToCartAlert(productName = 'Item') {
//         // Remove any existing alerts
//         const existingAlert = document.querySelector('.custom-alert');
//         if (existingAlert) {
//             existingAlert.remove();
//         }

//         // Create alert element
//         const alertDiv = document.createElement('div');
//         alertDiv.className = 'custom-alert';
//         alertDiv.innerHTML = `
//             <span class="alert-icon">🛒</span>
//             <span>${productName} added to cart successfully!</span>
//             <button class="close-btn" onclick="this.parentElement.remove()">×</button>
//         `;

//         // Add to page
//         document.body.appendChild(alertDiv);

//         // Show alert with animation
//         setTimeout(() => {
//             alertDiv.classList.add('show');
//         }, 100);

//         // Auto remove after 4 seconds
//         setTimeout(() => {
//             if (alertDiv.parentElement) {
//                 alertDiv.classList.remove('show');
//                 setTimeout(() => {
//                     if (alertDiv.parentElement) {
//                         alertDiv.remove();
//                     }
//                 }, 300);
//             }
//         }, 4000);
//     }

//     // Add event listener to "Add to Cart" links
//     function initializeAddToCartAlert() {
//         const addToCartLinks = document.querySelectorAll('a[href*="/cart/add/"]');
        
//         addToCartLinks.forEach(link => {
//             link.addEventListener('click', function(e) {
//                 e.preventDefault();
                
//                 // Get product name from page header
//                 const productName = document.querySelector('.page-header')?.textContent || 'Product';
                
//                 // Show alert
//                 showAddToCartAlert(productName);
                
//                 // Optional: Still proceed with the actual cart addition
//                 // You can uncomment the line below if you want to continue with the original link
//                 // window.location.href = this.href;
                
//                 // Or make an AJAX request to add to cart
//                 addToCartAjax(this.href, productName);
//             });
//         });
//     }

//     // AJAX Add to Cart (optional - for better UX)
//     function addToCartAjax(url, productName) {
//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'X-Requested-With': 'XMLHttpRequest'
//             }
//         })
//         .then(response => {
//             if (response.ok) {
//                 // Success - alert is already shown
//                 console.log('Product added to cart successfully');
//             } else {
//                 // Handle error
//                 showErrorAlert('Failed to add product to cart. Please try again.');
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             showErrorAlert('Network error. Please check your connection.');
//         });
//     }

//     // Error alert function
//     function showErrorAlert(message) {
//         const alertDiv = document.createElement('div');
//         alertDiv.className = 'custom-alert';
//         alertDiv.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
//         alertDiv.innerHTML = `
//             <span class="alert-icon">⚠️</span>
//             <span>${message}</span>
//             <button class="close-btn" onclick="this.parentElement.remove()">×</button>
//         `;

//         document.body.appendChild(alertDiv);

//         setTimeout(() => {
//             alertDiv.classList.add('show');
//         }, 100);

//         setTimeout(() => {
//             if (alertDiv.parentElement) {
//                 alertDiv.classList.remove('show');
//                 setTimeout(() => {
//                     if (alertDiv.parentElement) {
//                         alertDiv.remove();
//                     }
//                 }, 300);
//             }
//         }, 5000);
//     }

//     // Keyboard navigation for image gallery
//     document.addEventListener('keydown', function(e) {
//         if (productImages.length > 1) {
//             if (e.key === 'ArrowLeft') {
//                 changeImage(-1);
//             } else if (e.key === 'ArrowRight') {
//                 changeImage(1);
//             }
//         }
//     });

//     // Initialize everything
//     initializeImageGallery();
//     initializeAddToCartAlert();
// });

// // Auto-advance images (optional - uncomment if you want slideshow)
// /*
// setInterval(() => {
//     if (productImages.length > 1) {
//         changeImage(1);
//     }
// }, 5000); // Change image every 5 seconds
// */



// Add to Cart Alert Functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Show Add to Cart Alert
    function showAddToCartAlert(productName = 'Item') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-alert';
        alertDiv.innerHTML = `
            <span class="alert-icon">🛒</span>
            <span>${productName} added to cart successfully!</span>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;

        // Add to page
        document.body.appendChild(alertDiv);

        // Show alert with animation
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.classList.remove('show');
                setTimeout(() => {
                    if (alertDiv.parentElement) {
                        alertDiv.remove();
                    }
                }, 300);
            }
        }, 4000);
    }

    // Initialize Add to Cart Alert
    function initializeAddToCartAlert() {
        const addToCartLinks = document.querySelectorAll('a[href*="/cart/add/"]');
        
        addToCartLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get product name from page header
                const productName = document.querySelector('.page-header')?.textContent || 'Product';
                
                // Show alert
                showAddToCartAlert(productName);
                
                // Add to cart via AJAX
                addToCartAjax(this.href, productName);
            });
        });
    }

    // AJAX Add to Cart
    function addToCartAjax(url, productName) {
        fetch(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (response.ok) {
                console.log('Product added to cart successfully');
            } else {
                showErrorAlert('Failed to add product to cart. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorAlert('Network error. Please check your connection.');
        });
    }

    // Show Error Alert
    function showErrorAlert(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'custom-alert error-alert';
        alertDiv.innerHTML = `
            <span class="alert-icon">⚠️</span>
            <span>${message}</span>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 100);

        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.classList.remove('show');
                setTimeout(() => {
                    if (alertDiv.parentElement) {
                        alertDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Initialize the alert functionality
    initializeAddToCartAlert();
});