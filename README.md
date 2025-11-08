1. Event Propagation в JavaScript
Процесс распространения событий - это механизм, определяющий порядок обработки события элементами DOM дерева. Состоит из трех фаз:

Основные фазы:
Capture Phase (Фаза перехвата) - событие движется от window к целевому элементу

Target Phase (Фаза цели) - событие достигло целевого элемента

Bubble Phase (Фаза всплытия) - событие всплывает от целевого элемента к window

javascript
// Пример с всеми фазами
document.getElementById('parent').addEventListener('click', function(e) {
    console.log('Capture phase');
}, true); // true = capture phase

document.getElementById('child').addEventListener('click', function(e) {
    console.log('Target phase');
});

document.getElementById('parent').addEventListener('click', function(e) {
    console.log('Bubble phase');
}); // false/default = bubble phase
Практическое применение:
stopPropagation() - предотвращает дальнейшее распространение

javascript
element.addEventListener('click', (e) => {
    e.stopPropagation(); // Останавливает всплытие
});
stopImmediatePropagation() - останавливает все обработчики

preventDefault() - отменяет стандартное поведение браузера

Делегирование событий - обработка на родительском элементе

javascript
// Вместо обработчиков на каждой кнопке
document.getElementById('list').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        deleteItem(e.target.dataset.id);
    }
});
2. Promise и асинхронность в JavaScript
Promise (Обещание) - объект для работы с асинхронными операциями
Состояния Promise:

pending (ожидание) - начальное состояние

fulfilled (выполнено) - операция завершена успешно

rejected (отклонено) - операция завершена с ошибкой

javascript
const promise = new Promise((resolve, reject) => {
    // Асинхронная операция
    setTimeout(() => {
        const success = Math.random() > 0.5;
        success ? resolve('Успех!') : reject('Ошибка!');
    }, 1000);
});

promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log('Завершено'));
Альтернативные способы обработки асинхронности:
Callback функции (старый подход)

javascript
function fetchData(callback) {
    setTimeout(() => callback('Данные'), 1000);
}
Async/Await (современный подход)

javascript
async function getData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка:', error);
    }
}
Generators + Promises

javascript
function* asyncGenerator() {
    const result = yield fetch('/api/data');
    console.log(result);
}
Роль Event Loop (Событийного цикла)
Event Loop - механизм, который управляет выполнением кода, обработкой событий и вызовом колбэков.

Принцип работы:

Call Stack (стек вызовов) - выполняет синхронный код

Callback Queue (очередь колбэков) - хранит готовые к выполнению колбэки

Microtask Queue (очередь микрозадач) - для Promise (приоритет выше)

Event Loop - перемещает задачи из очередей в стек когда он пуст

javascript
console.log('1'); // Синхронно

setTimeout(() => console.log('2'), 0); // Макрозадача

Promise.resolve().then(() => console.log('3')); // Микрозадача

console.log('4'); // Синхронно

// Результат: 1, 4, 3, 2
3. ООП в JavaScript
ООП (Объектно-Ориентированное Программирование) - парадигма, основанная на объектах
Ключевые принципы:
Инкапсуляция - сокрытие внутренней реализации

javascript
class BankAccount {
    #balance = 0; // Приватное поле

    deposit(amount) {
        this.#balance += amount;
    }

    getBalance() {
        return this.#balance;
    }
}
Наследование - создание новых классов на основе существующих

javascript
class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        console.log(`${this.name} издает звук`);
    }
}

class Dog extends Animal {
    speak() {
        console.log(`${this.name} лает`);
    }
}
Полиморфизм - использование объектов разных классов через общий интерфейс

javascript
class Cat extends Animal {
    speak() {
        console.log(`${this.name} мяукает`);
    }
}

const animals = [new Dog('Бобик'), new Cat('Мурка')];
animals.forEach(animal => animal.speak()); // Разное поведение
Абстракция - упрощение сложных систем

javascript
class Car {
    startEngine() {
        this.#checkFuel();
        this.#ignite();
        console.log('Двигатель запущен');
    }

    #checkFuel() { /* ... */ }
    #ignite() { /* ... */ }
}
Реализация ООП в JavaScript:
Прототипное наследование:

javascript
// Конструктор функция
function Person(name) {
    this.name = name;
}

// Методы в прототипе
Person.prototype.greet = function() {
    console.log(`Привет, я ${this.name}`);
};

// Наследование
function Student(name, grade) {
    Person.call(this, name);
    this.grade = grade;
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;
Современный синтаксис (ES6+):

javascript
class Person {
    constructor(name) {
        this.name = name;
    }

    greet() {
        console.log(`Привет, я ${this.name}`);
    }

    // Статический метод
    static createAnonymous() {
        return new Person('Аноним');
    }
}
4. Обработка URL браузером
Детальный процесс:
Ввод URL → браузер проверяет кэш DNS

DNS Lookup - если IP нет в кэше:

Запрос к DNS серверу

Получение IP адреса

TCP Handshake - установка соединения (SYN → SYN-ACK → ACK)

TLS Handshake (для HTTPS) - безопасное соединение

HTTP Запрос - браузер отправляет GET запрос

HTTP Ответ - сервер возвращает HTML и ресурсы

Рендеринг страницы:
Parsing HTML → построение DOM дерева

Parsing CSS → построение CSSOM дерева

Render Tree - комбинация DOM + CSSOM

Layout - расчет позиций и размеров элементов

Paint - отрисовка пикселей

Composition - композиция слоев

javascript
// Критический путь рендеринга
HTML → DOM → CSSOM → Render Tree → Layout → Paint
Технологии ускорения:
CDN (Content Delivery Network) - географическое распределение контента

HTTP/2 - мультиплексирование запросов

Preload/Prefetch - предзагрузка ресурсов

html
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.html">
Lazy Loading - отложенная загрузка

html
<img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy">
Service Workers - кэширование и оффлайн работа

Tree Shaking - удаление неиспользуемого кода

Проблемы безопасности:
CORS (Cross-Origin Resource Sharing)

javascript
// Сервер должен отправлять заголовки:
Access-Control-Allow-Origin: https://trusted-site.com
Access-Control-Allow-Methods: GET, POST
CSRF (Cross-Site Request Forgery)

html
<!-- Защита через токены -->
<form>
    <input type="hidden" name="csrf_token" value="random-token">
</form>
XSS (Cross-Site Scripting)

javascript
// Защита - санитизация ввода
function sanitize(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
CSP (Content Security Policy)

html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://apis.google.com">
Проблемы междоменного взаимодействия:
Same-Origin Policy - ограничения доступа между разными доменами

CORS Preflight - дополнительные OPTIONS запросы

Cookie Restrictions - ограничения для кросс-доменных кук

Iframe Security - ограничения доступа к содержимому iframe

Эти ответы показывают глубокое понимание как практических, так и теоретических аспектов веб-разработки! 🚀
