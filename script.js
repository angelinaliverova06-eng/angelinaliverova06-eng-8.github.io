// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const openFormBtn = document.getElementById('openFormBtn');
    const modal = document.getElementById('feedbackModal');
    const closeBtn = document.querySelector('.close');
    const feedbackForm = document.getElementById('feedbackForm');
    const messageContainer = document.getElementById('messageContainer');
    
    // Ключ для LocalStorage
    const STORAGE_KEY = 'feedbackFormData';
    
    const FORM_SUBMIT_URL = 'https://formcarry.com/s/SVZKwJPOrm-';
    
    // Открытие формы
    openFormBtn.addEventListener('click', openModal);
    
    // Закрытие формы
    closeBtn.addEventListener('click', closeModal);
    
    // Закрытие формы при клике вне её области
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Обработка отправки формы
    feedbackForm.addEventListener('submit', handleFormSubmit);
    
    // Обработка нажатия кнопки "Назад" в браузере
    window.addEventListener('popstate', function(event) {
        if (modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Функция открытия модального окна
    function openModal() {
        modal.style.display = 'block';
        // Изменяем URL с помощью History API
        history.pushState({ formOpen: true }, '', '#feedback');
        // Восстанавливаем данные из LocalStorage
        restoreFormData();
    }
    
    // Функция закрытия модального окна
    function closeModal() {
        modal.style.display = 'none';
        // Возвращаем URL к исходному состоянию
        if (window.location.hash === '#feedback') {
            history.back();
        }
        // Очищаем сообщения
        clearMessages();
    }
    
    // Функция сохранения данных формы в LocalStorage
    function saveFormData() {
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            organization: document.getElementById('organization').value,
            message: document.getElementById('message').value,
            privacyPolicy: document.getElementById('privacyPolicy').checked
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
    
    // Функция восстановления данных формы из LocalStorage
    function restoreFormData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            document.getElementById('fullName').value = formData.fullName || '';
            document.getElementById('email').value = formData.email || '';
            document.getElementById('phone').value = formData.phone || '';
            document.getElementById('organization').value = formData.organization || '';
            document.getElementById('message').value = formData.message || '';
            document.getElementById('privacyPolicy').checked = formData.privacyPolicy || false;
        }
    }
    
    // Функция очистки данных формы в LocalStorage
    function clearFormData() {
        localStorage.removeItem(STORAGE_KEY);
    }
    
    // Функция обработки отправки формы
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // Проверяем согласие с политикой
        if (!document.getElementById('privacyPolicy').checked) {
            showMessage('Для отправки формы необходимо согласие с политикой обработки персональных данных', 'error');
            return;
        }
        
        // Собираем данные формы
        const formData = new FormData(feedbackForm);
        const data = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            organization: formData.get('organization'),
            message: formData.get('message')
        };
        
        // Отправляем данные с помощью fetch
        fetch(FORM_SUBMIT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.json();
        })
        .then(result => {
            // Показываем сообщение об успехе
            showMessage('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
            // Очищаем форму
            feedbackForm.reset();
            // Очищаем данные в LocalStorage
            clearFormData();
        })
        .catch(error => {
            // Показываем сообщение об ошибке
            showMessage('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.', 'error');
            console.error('Ошибка:', error);
        });
    }
    
    // Функция показа сообщения
    function showMessage(text, type) {
        clearMessages();
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = text;
        
        messageContainer.appendChild(messageElement);
        
        // Автоматически скрываем сообщение через 5 секунд
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }
    
    // Функция очистки сообщений
    function clearMessages() {
        while (messageContainer.firstChild) {
            messageContainer.removeChild(messageContainer.firstChild);
        }
    }
    
    // Сохраняем данные формы при изменении
    const formInputs = feedbackForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', saveFormData);
    });
    
    // Для чекбокса используем событие change
    document.getElementById('privacyPolicy').addEventListener('change', saveFormData);
    
    // Восстанавливаем данные формы при загрузке страницы
    restoreFormData();
});