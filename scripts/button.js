const buttons = document.querySelectorAll('.button');
        // Add click event to each button
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove 'active' class from all buttons
                buttons.forEach(btn => btn.classList.remove('active'));
                // Add 'active' class to the clicked button
                button.classList.add('active');
            });
        });