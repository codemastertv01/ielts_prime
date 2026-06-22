import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Code, Zap } from 'lucide-react';

const CompleteRoadmap = () => {
    const [expandedSections, setExpandedSections] = useState({});
    const [activeFramework, setActiveFramework] = useState('javascript');

    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const frameworks = [
        { id: 'javascript', name: 'JavaScript', color: 'bg-yellow-500' },
        { id: 'react', name: 'React.js', color: 'bg-blue-500' },
        { id: 'nextjs', name: 'Next.js', color: 'bg-black' },
        { id: 'typescript', name: 'TypeScript', color: 'bg-indigo-500' },
    ];

    const roadmapData = {
        javascript: [
            {
                id: 'js-1',
                level: "BOSHLANG'ICH DARAJA",
                color: "bg-yellow-50 border-yellow-200",
                headerColor: "bg-yellow-100",
                sections: [
                    {
                        id: "js-1-1",
                        category: "JavaScript Asoslari",
                        topics: [
                            { name: "O'zgaruvchilar: var, let, const - farqlari va qo'llanishi", description: "JavaScriptda o'zgaruvchilar ma'lumot saqlash uchun ishlatiladi, lekin ularning deklaratsiya usullari scope va mutability jihatidan farq qiladi. `var` – function-scope, hoisting bilan ishlaydi (deklaratsiya tepaga ko'chiriladi, lekin qiymat berilmasa undefined bo'ladi). Masalan, `console.log(x); var x = 5;` undefined chiqaradi. `let` va `const` – block-scope (masalan, if ichida deklaratsiya qilingan bo'lsa, tashqarida ishlamaydi). `let` qiymatni o'zgartirishga ruxsat beradi, `const` esa yo'q – lekin const object yoki array uchun reference o'zgarmaydi, ammo ichki qiymatlar o'zgartirilishi mumkin (masalan, `const arr = []; arr.push(1);` – OK, lekin `arr = []` – xato). Ichki mexanizm: V8 engine'da `var` global objectga bog'lanadi, bu window pollutionga olib keladi. Optimallashtirish: Har doim `const`dan foydalaning, chunki engine uni static tahlil qiladi va tezroq ishlaydi. Potentsial xato: Temporal Dead Zone (TDZ) – `let/const` deklaratsiyadan oldin murojaat qilsangiz ReferenceError. Real misol: Loop ichida `var` ishlatish closure xatosiga olib keladi (masalan, for loopda setTimeout bilan), lekin `let` bu muammoni hal qiladi." },
                            { name: "Ma'lumot turlari: Primitive vs Reference types", description: "Primitive turlar (string, number, boolean, null, undefined, symbol, bigint) – qiymat bo'yicha saqlanadi va o'zgarmas (immutable). Masalan, `let a = 5; let b = a; b = 6;` – a o'zgarmaydi. Reference turlar (object, array, function) – heap'da saqlanadi, o'zgaruvchi esa pointer saqlaydi. `let obj1 = {}; let obj2 = obj1; obj2.prop = 1;` – obj1 ham o'zgaradi. Farq: Primitive'lar stack'da, reference'lar heap'da. Engine ichida: Garbage collection primitive'larni osongina tozalaydi, reference'larda cycle bo'lsa memory leak. Optimallashtirish: Deep copy uchun structuredClone() (ES2022) ishlatish. Kam biladigan: Symbol – unique identifier, masalan Symbol.for('key') global registrydan oladi. BigInt – katta sonlar uchun, lekin number bilan mix qilish xato (masalan, 1n + 1 – TypeError)." },
                            { name: "String, Number, Boolean, BigInt, Symbol", description: "String: Unicode support, immutable. Number: IEEE 754 double-precision, max safe integer 2^53-1. Boolean: true/false. BigInt: Arbitrarily large integers, suffix 'n' (masalan, 123n). Symbol: Unique va immutable primitive, object key sifatida ideal (masalan, const sym = Symbol('desc'); obj[sym] = val;). Ichki: Symbol iteratorlar uchun ishlatiladi (masalan, @@iterator). Performance: String concatenation loop ichida qimmat (new string yaratadi), shuning uchun join() ishlatish yaxshi." },
                            { name: "null va undefined farqi", description: "undefined – qiymat berilmagan o'zgaruvchi, null – intentional empty qiymat. Engine'da: undefined global property, null – literal. Farq: typeof null == 'object' (historical bug), typeof undefined == 'undefined'. Best practice: null ni ma'lumot yo'qligini bildirish uchun ishlatish. Xato: JSON.stringify({x: undefined}) – { } chiqaradi, lekin null saqlanadi." },
                            { name: "typeof operator", description: "Qiymat turini qaytaradi: 'string', 'number', etc. Lekin typeof null == 'object' – bug. typeof function == 'function'. Ichki: V8 da internal taglarga asoslangan. Alternative: Object.prototype.toString.call(val) – [object Type] qaytaradi." },
                            { name: "Type coercion va type conversion", description: "Coercion – avtomatik (masalan, '5' + 3 == '53'). Conversion – qo'lda (Number('5')). Rules: + bilan string bo'lsa stringga, == bilan null/undefined equal, lekin NaN hech narsaga equal emas. Ichki: ToPrimitive() internal method. Xato: [] == ![] == true (coercion chain)." },
                            { name: "Operatorlar: arifmetik, taqqoslash, mantiqiy, bitwise", description: "Arifmetik: +, -, *, /, %, **. Taqqoslash: == (loose), === (strict). Mantiqiy: &&, ||, !. Bitwise: &, |, ^, ~, <<, >>, >>>. Ichki: Bitwise 32-bit integers uchun, number'lar int32 ga convert qilinadi. Optimallashtirish: >>> 0 unsigned int uchun." },
                            { name: "Ternary operator va nullish coalescing (??)", description: "Ternary: cond ? true : false. ?? – falsy emas, faqat null/undefined uchun default (masalan, null ?? 'default'). ??= assignment." },
                            { name: "String metodlari: slice, substring, charAt, indexOf, includes", description: "slice(start, end) – negative index support. substring – negative ni 0 ga aylantiradi. charAt – indexdagi char. indexOf – position, includes – boolean. Performance: includes ES6, eski browserlarda polyfill." },
                            { name: "Template literals va string interpolation", description: "`hello ${name}`. Tagged templates: func`hello ${name}` – func ga array va values beradi. Use case: Styled components." }
                        ]
                    },
                    {
                        id: "js-1-2",
                        category: "Shartlar va Sikllar",
                        topics: [
                            { name: "if, else if, else statements", description: "Block scope bilan ishlaydi. Truthy/falsy: 0, '', NaN, null, undefined – falsy." },
                            { name: "switch case va break/default", description: "Strict === ishlatadi. Fall-through without break." },
                            { name: "Truthy va Falsy values", description: "Falsy: false, 0, -0, '', NaN, null, undefined. Boshqalar truthy." },
                            { name: "Short-circuit evaluation (&&, ||)", description: "&& – birinchi falsy qaytaradi, || – birinchi truthy. Use: default = param || 'default'." },
                            { name: "for loop va iteratsiya", description: "for (init; cond; incr) {}. Hoisting bilan." },
                            { name: "while va do-while loops", description: "while – cond oldin, do-while – keyin." },
                            { name: "for...in loop (objects uchun)", description: "Enumerable properties iteratsiya qiladi, including inherited." },
                            { name: "for...of loop (iterables uchun)", description: "Values iteratsiya, arrays, maps, sets uchun." },
                            { name: "break va continue statements", description: "break – sikldan chiqish, continue – next iteration." },
                            { name: "Labeled statements", description: "label: for(...) { break label; } – nested loops uchun." }
                        ]
                    },
                    {
                        id: "js-1-3",
                        category: "Funksiyalar",
                        topics: [
                            { name: "Function declaration vs function expression", description: "Declaration: hoisting, expression: yo'q." },
                            { name: "Arrow functions sintaksisi", description: "() => {}. No own this, arguments." },
                            { name: "Parameters va arguments", description: "arguments – array-like object." },
                            { name: "Default parameters", description: "function(x=1) {}." },
                            { name: "Rest parameters (...args)", description: "Array qiladi." },
                            { name: "Return statements", description: "Implicit undefined if no return." },
                            { name: "Function scope va block scope", description: "var – function, let/const – block." },
                            { name: "Hoisting - function hoisting", description: "Declarations tepaga." },
                            { name: "Callback functions", description: "Function as argument." },
                            { name: "Anonymous functions", description: "No name." }
                        ]
                    },
                    {
                        id: "js-1-4",
                        category: "Massivlar (Arrays)",
                        topics: [
                            { name: "Array yaratish: literal, constructor", description: "[] or new Array()." },
                            { name: "Array elementlariga murojaat: index", description: "arr[0]." },
                            { name: "Array length property", description: "Dynamic." },
                            { name: "push, pop, shift, unshift", description: "End/start add/remove." },
                            { name: "splice va slice farqi", description: "splice mutates, slice copy." },
                            { name: "concat - massivlarni birlashtirish", description: "New array." },
                            { name: "indexOf, lastIndexOf, includes", description: "Search." },
                            { name: "join va split", description: "String/array convert." },
                            { name: "reverse va sort", description: "Mutate." },
                            { name: "Multi-dimensional arrays", description: "Nested arrays." }
                        ]
                    },
                    {
                        id: "js-1-5",
                        category: "Objektlar (Objects)",
                        topics: [
                            { name: "Object literal sintaksisi", description: "{}." },
                            { name: "Property access: dot notation vs bracket notation", description: "obj.prop or obj['prop']." },
                            { name: "Adding va deleting properties", description: "obj.new = val; delete obj.prop." },
                            { name: "Object methods", description: "obj.method = function(){}." },
                            { name: "this keyword asoslari", description: "Context." },
                            { name: "Object.keys(), Object.values(), Object.entries()", description: "Arrays of keys/values/pairs." },
                            { name: "Object destructuring basics", description: "{prop} = obj." },
                            { name: "Nested objects", description: "obj.inner = {}." },
                            { name: "Object reference vs primitive values", description: "Copy reference." },
                            { name: "Comparing objects", description: "Reference equal, deep equal yo'q." }
                        ]
                    }
                ]
            },
            {
                id: 'js-2',
                level: "O'RTA DARAJA",
                color: "bg-orange-50 border-orange-200",
                headerColor: "bg-orange-100",
                sections: [
                    {
                        id: "js-2-1",
                        category: "ES6+ Xususiyatlari",
                        topics: [
                            { name: "let va const: block scope", description: "TDZ bilan." },
                            { name: "Arrow functions va this binding", description: "Lexical this." },
                            { name: "Destructuring: arrays va objects", description: "[a,b] = arr; nested possible." },
                            { name: "Spread operator (...) - clone, merge", description: "Shallow copy." },
                            { name: "Rest parameters", description: "As above." },
                            { name: "Default parameters", description: "As above." },
                            { name: "Enhanced object literals", description: "Shorthand: {x} for {x:x}." },
                            { name: "Computed property names", description: "{[key]: val}." },
                            { name: "Shorthand property va method syntax", description: "method() {}." },
                            { name: "Optional chaining (?.)", description: "obj?.prop." },
                            { name: "Nullish coalescing operator (??)", description: "As above." },
                            { name: "Logical assignment operators (||=, &&=, ??=)", description: "x ||= y." }
                        ]
                    },
                    {
                        id: "js-2-2",
                        category: "Advanced Functions",
                        topics: [
                            { name: "First-class functions", description: "Functions as values." },
                            { name: "Higher-order functions", description: "Return or take functions." },
                            { name: "Closures - scope chain", description: "Inner function outer scope access. Memory: Long-lived closures leak if not careful." },
                            { name: "IIFE (Immediately Invoked Function Expression)", description: "(function(){})(); – Private scope." },
                            { name: "Function currying", description: "function(a)(b) – Partial application." },
                            { name: "Function composition", description: "pipe(f,g) = x => g(f(x))." },
                            { name: "Recursion va recursive functions", description: "Stack overflow risk, tail call optimization (TCO) in some engines." },
                            { name: "Call, apply, bind methods", description: "this change: call(args), apply(array), bind(permanent)." },
                            { name: "Pure functions", description: "No side effects, same input same output." },
                            { name: "Function memoization", description: "Cache results." }
                        ]
                    },
                    {
                        id: "js-2-3",
                        category: "Array Methods (Advanced)",
                        topics: [
                            { name: "map() - transformation", description: "New array." },
                            { name: "filter() - filtering", description: "New array." },
                            { name: "reduce() - aggregation", description: "Accumulator." },
                            { name: "find() va findIndex()", description: "First match." },
                            { name: "some() va every()", description: "Boolean." },
                            { name: "forEach() vs map()", description: "forEach no return." },
                            { name: "flat() va flatMap()", description: "Flatten." },
                            { name: "Array.from() va Array.of()", description: "Create from iterable." },
                            { name: "Method chaining", description: "arr.map().filter()." },
                            { name: "Performance considerations", description: "reduce can be slower for large arrays." }
                        ]
                    },
                    {
                        id: "js-2-4",
                        category: "Asynchronous JavaScript",
                        topics: [
                            { name: "Synchronous vs Asynchronous code", description: "Blocking vs non." },
                            { name: "setTimeout va setInterval", description: "Min delay 4ms in browsers." },
                            { name: "Callbacks va callback hell", description: "Nested callbacks." },
                            { name: "Promises: resolve, reject", description: "new Promise((res,rej)=>{})." },
                            { name: "Promise chaining (.then, .catch)", description: "Return promise." },
                            { name: "Promise.all(), Promise.race()", description: "Parallel." },
                            { name: "Promise.allSettled(), Promise.any()", description: "All results, first resolved." },
                            { name: "Async/Await sintaksisi", description: "Promise wrapper." },
                            { name: "Error handling: try-catch", description: "In async." },
                            { name: "async function return values", description: "Always promise." }
                        ]
                    },
                    {
                        id: "js-2-5",
                        category: "DOM Manipulation",
                        topics: [
                            { name: "Document Object Model (DOM) tree", description: "HTML tree." },
                            { name: "Selecting elements: getElementById, querySelector", description: "ID, CSS selector." },
                            { name: "querySelectorAll vs getElementsByClassName", description: "NodeList vs HTMLCollection (live)." },
                            { name: "Creating elements: createElement", description: "document.createElement('div')." },
                            { name: "Modifying content: innerHTML, textContent, innerText", description: "innerHTML – HTML parse, textContent – text, innerText – visible text." },
                            { name: "Modifying attributes: setAttribute, getAttribute", description: "attr." },
                            { name: "Modifying styles: style property, classList", description: "elem.style.color, classList.add/remove." },
                            { name: "Adding/removing elements: appendChild, removeChild", description: "Parent methods." },
                            { name: "insertBefore, insertAdjacentHTML", description: "Position insert." },
                            { name: "Cloning nodes: cloneNode", description: "Deep/shallow." }
                        ]
                    },
                    {
                        id: "js-2-6",
                        category: "Events",
                        topics: [
                            { name: "Event listeners: addEventListener", description: "Multiple listeners." },
                            { name: "Event object va event properties", description: "target, currentTarget." },
                            { name: "Event types: click, input, submit, keydown, etc.", description: "Standard events." },
                            { name: "Event bubbling va capturing", description: "Bubble up, capture down." },
                            { name: "Event delegation", description: "Parent listener, check target." },
                            { name: "preventDefault() va stopPropagation()", description: "Default action stop, propagation stop." },
                            { name: "removeEventListener", description: "Same function." },
                            { name: "Custom events: CustomEvent", description: "new CustomEvent('name', {detail: data})." },
                            { name: "Event.target vs Event.currentTarget", description: "Original vs listener element." },
                            { name: "Keyboard events va key codes", description: "key, code, keyCode (deprecated)." }
                        ]
                    },
                    {
                        id: "js-2-7",
                        category: "Object-Oriented JavaScript",
                        topics: [
                            { name: "Constructor functions", description: "function Person() {this.name = '';} new Person()." },
                            { name: "Prototype va prototype chain", description: "Shared methods." },
                            { name: "Object.create()", description: "Proto set." },
                            { name: "ES6 Classes sintaksisi", description: "class Person {}." },
                            { name: "Class constructor", description: "constructor() {}." },
                            { name: "Class methods va properties", description: "method() {}." },
                            { name: "Static methods", description: "static meth() {}." },
                            { name: "Getters va Setters", description: "get prop() {}, set prop(v) {}." },
                            { name: "Inheritance: extends keyword", description: "class Child extends Parent {}." },
                            { name: "super keyword", description: "Parent call." },
                            { name: "Private fields (#)", description: "#private = 1; – True private." },
                            { name: "Encapsulation principles", description: "Hide internals." }
                        ]
                    }
                ]
            },
            {
                id: 'js-3',
                level: "YUQORI DARAJA",
                color: "bg-red-50 border-red-200",
                headerColor: "bg-red-100",
                sections: [
                    {
                        id: "js-3-1",
                        category: "Advanced Async Patterns",
                        topics: [
                            { name: "Promise internals", description: "States: pending, fulfilled, rejected. Microtask queue." },
                            { name: "Microtasks vs Macrotasks", description: "Micro: Promise.then, macro: setTimeout." },
                            { name: "Event loop deep dive", description: "Call stack, task queue, microtask queue, render." },
                            { name: "Call stack va callback queue", description: "Stack overflow if recursion deep." },
                            { name: "Async iterators va generators", description: "async function* {}, for await...of." },
                            { name: "async function* sintaksisi", description: "Yield promises." },
                            { name: "for await...of", description: "Async iterable." },
                            { name: "AbortController va cancellation", description: "signal.abort()." },
                            { name: "Race conditions handling", description: "Mutex or locks (workers)." },
                            { name: "Concurrent requests optimization", description: "Promise.all with limits." }
                        ]
                    },
                    {
                        id: "js-3-2",
                        category: "Modules",
                        topics: [
                            { name: "ES6 Modules: import/export", description: "Static analysis." },
                            { name: "Named exports vs default export", description: "export {name}, export default." },
                            { name: "Dynamic imports: import()", description: "Promise returns module." },
                            { name: "Module bundlers: Webpack, Rollup", description: "Tree shaking." },
                            { name: "CommonJS vs ES Modules", description: "require vs import, sync vs async." },
                            { name: "Tree shaking", description: "Unused code remove." },
                            { name: "Code splitting strategies", description: "Dynamic imports for chunks." },
                            { name: "Module patterns", description: "Revealing module." },
                            { name: "Circular dependencies", description: "Avoid or handle." },
                            { name: "Package.json va dependencies", description: "Semver." }
                        ]
                    },
                    {
                        id: "js-3-3",
                        category: "Advanced Objects",
                        topics: [
                            { name: "Object descriptors: configurable, enumerable, writable", description: "Object.getOwnPropertyDescriptor." },
                            { name: "Object.defineProperty()", description: "Set descriptors." },
                            { name: "Object.freeze() va Object.seal()", description: "Immutable, no add/delete." },
                            { name: "Proxy objects", description: "Traps: get, set, etc." },
                            { name: "Reflect API", description: "Proxy helpers." },
                            { name: "Property enumeration", description: "for...in, Object.keys." },
                            { name: "Object immutability", description: "Deep freeze." },
                            { name: "WeakMap va WeakSet", description: "Weak references, GC." },
                            { name: "Symbol va well-known symbols", description: "Symbol.iterator, etc." },
                            { name: "Object.is() vs ===", description: "Object.is(-0, 0) == false." }
                        ]
                    },
                    {
                        id: "js-3-4",
                        category: "Regular Expressions",
                        topics: [
                            { name: "RegEx sintaksisi asoslari", description: "/pattern/flags." },
                            { name: "Pattern matching", description: "test, exec." },
                            { name: "Character classes va quantifiers", description: "[a-z], {n,m}." },
                            { name: "Anchors: ^, $, \\b", description: "Start, end, word boundary." },
                            { name: "Groups va capturing groups", description: "(group), named (? <name>)." },
                            { name: "Lookahead va lookbehind", description: "(?=), (?<=)." },
                            { name: "Flags: g, i, m, s, u, y", description: "Global, case ins, multiline, dotall, unicode, sticky." },
                            { name: "test(), exec(), match(), replace()", description: "Methods." },
                            { name: "RegEx performance", description: "Backtracking avoid." },
                            { name: "Common patterns", description: "Email, URL validation." }
                        ]
                    },
                    {
                        id: "js-3-5",
                        category: "Error Handling",
                        topics: [
                            { name: "Error types: Error, TypeError, ReferenceError", description: "Built-in." },
                            { name: "Custom error classes", description: "class MyError extends Error {}." },
                            { name: "try-catch-finally", description: "Catch errors." },
                            { name: "Throwing errors: throw new Error()", description: "Manual." },
                            { name: "Error propagation", description: "Up the stack." },
                            { name: "Async error handling", description: "await try-catch." },
                            { name: "Global error handling: window.onerror", description: "Uncaught." },
                            { name: "Promise rejection handling", description: "unhandledrejection event." },
                            { name: "Debugging techniques", description: "debugger;, console.trace." },
                            { name: "Error logging best practices", description: "Sentry integration." }
                        ]
                    },
                    {
                        id: "js-3-6",
                        category: "Memory Management",
                        topics: [
                            { name: "JavaScript memory model", description: "Stack: primitives, heap: objects." },
                            { name: "Stack vs Heap memory", description: "Fixed vs dynamic." },
                            { name: "Garbage collection", description: "Mark-and-sweep." },
                            { name: "Memory leaks: common causes", description: "Global vars, forgotten timers." },
                            { name: "WeakMap va WeakSet uchun", description: "No leak." },
                            { name: "Closure memory considerations", description: "Unused vars hold." },
                            { name: "Event listener cleanup", description: "removeEventListener." },
                            { name: "Performance profiling", description: "Chrome Memory tab." },
                            { name: "Chrome DevTools Memory", description: "Heap snapshots." },
                            { name: "Optimization techniques", description: "Avoid large objects." }
                        ]
                    },
                    {
                        id: "js-3-7",
                        category: "Design Patterns",
                        topics: [
                            { name: "Module pattern", description: "IIFE with return." },
                            { name: "Revealing module pattern", description: "Private/public." },
                            { name: "Singleton pattern", description: "One instance." },
                            { name: "Factory pattern", description: "Create objects." },
                            { name: "Observer pattern", description: "Pub/sub." },
                            { name: "Pub/Sub pattern", description: "Events." },
                            { name: "Decorator pattern", description: "Add behavior." },
                            { name: "Strategy pattern", description: "Interchange algos." },
                            { name: "MVC, MVP, MVVM", description: "Architectures." },
                            { name: "Functional programming patterns", description: "Immutable, pure." }
                        ]
                    },
                    {
                        id: "js-3-8",
                        category: "Browser APIs",
                        topics: [
                            { name: "Fetch API va XMLHttpRequest", description: "Promise-based fetch." },
                            { name: "LocalStorage va SessionStorage", description: "Key-value, 5MB." },
                            { name: "IndexedDB", description: "NoSQL DB." },
                            { name: "Web Workers", description: "Background threads." },
                            { name: "Service Workers", description: "Offline, cache." },
                            { name: "Geolocation API", description: "navigator.geolocation." },
                            { name: "Notification API", description: "Desktop notifications." },
                            { name: "Canvas API basics", description: "2D drawing." },
                            { name: "WebSockets", description: "Real-time." },
                            { name: "History API", description: "pushState." }
                        ]
                    },
                    {
                        id: "js-3-9",
                        category: "Testing",
                        topics: [
                            { name: "Unit testing concepts", description: "Isolate tests." },
                            { name: "Jest framework", description: "describe, it, expect." },
                            { name: "Test structure: describe, it, expect", description: "Grouping." },
                            { name: "Mocking: jest.fn(), jest.mock()", description: "Fake functions." },
                            { name: "Async testing", description: "async/await in tests." },
                            { name: "Code coverage", description: "istanbul." },
                            { name: "TDD (Test-Driven Development)", description: "Test first." },
                            { name: "Integration testing", description: "Multiple units." },
                            { name: "E2E testing basics", description: "Cypress." },
                            { name: "Testing best practices", description: "80% coverage." }
                        ]
                    },
                    {
                        id: "js-3-10",
                        category: "Performance",
                        topics: [
                            { name: "Performance measurement: Performance API", description: "performance.now()." },
                            { name: "Debouncing va throttling", description: "Rate limit." },
                            { name: "Lazy loading", description: "Dynamic imports." },
                            { name: "Critical rendering path", description: "HTML/CSS/JS order." },
                            { name: "Reflow va repaint", description: "Layout changes." },
                            { name: "RequestAnimationFrame", description: "Smooth animations." },
                            { name: "Web Vitals: LCP, FID, CLS", description: "Metrics." },
                            { name: "Bundle size optimization", description: "Minify, compress." },
                            { name: "Code minification", description: "Uglify." },
                            { name: "Caching strategies", description: "Cache-Control headers." }
                        ]
                    }
                ]
            }
        ],
        react: [
            {
                id: 'react-1',
                level: "BOSHLANG'ICH DARAJA",
                color: "bg-green-50 border-green-200",
                headerColor: "bg-green-100",
                sections: [
                    {
                        id: "react-1-1",
                        category: "React Fundamentals",
                        topics: [
                            { name: "React nima va Virtual DOM", description: "React - UI kutubxonasi, declarative. Virtual DOM - real DOM ni minimal update qiladi, diff algorithm (Fiber) bilan." },
                            { name: "Create React App", description: "npx create-react-app – setup with Babel, Webpack." },
                            { name: "JSX sintaksisi va qoidalari", description: "HTML-like, Babel transpile. Attributes: className, htmlFor." },
                            { name: "Components: Function vs Class", description: "Function: Hooks bilan, Class: Lifecycle methods." },
                            { name: "Props va PropTypes", description: "Data pass, PropTypes for validation." },
                            { name: "State: useState hook", description: "Local state, setState async." },
                            { name: "Event handling", description: "onClick={() => {}}." },
                            { name: "Conditional rendering", description: "{cond ? <Comp> : null}." },
                            { name: "Lists va Keys", description: "map(), key unique." },
                            { name: "Fragments", description: "<> </>." },
                            { name: "CSS Modules", description: "Scoped CSS." },
                            { name: "React Developer Tools", description: "Component tree inspect." }
                        ]
                    },
                    {
                        id: "react-1-2",
                        category: "Hooks Basics",
                        topics: [
                            { name: "useState - state management", description: "const [state, setState] = useState(initial)." },
                            { name: "useEffect - side effects", description: "Mount, update, unmount. Dependencies." },
                            { name: "useEffect cleanup", description: "return () => {}." },
                            { name: "Dependencies array", description: "[] for mount only." },
                            { name: "useRef - DOM access", description: "Mutable ref." },
                            { name: "Controlled components", description: "Input value from state." },
                            { name: "Forms handling", description: "onChange update state." },
                            { name: "Form validation", description: "Custom logic." },
                            { name: "Multiple inputs", description: "Name based update." },
                            { name: "Custom hooks basics", description: "useSomething()." }
                        ]
                    },
                    {
                        id: "react-1-3",
                        category: "Styling",
                        topics: [
                            { name: "CSS Modules", description: "import styles from './file.module.css'." },
                            { name: "Styled-components", description: "CSS-in-JS." },
                            { name: "Tailwind CSS", description: "Utility classes." },
                            { name: "Material-UI", description: "Component library." },
                            { name: "Ant Design", description: "UI kit." },
                            { name: "Inline styles", description: "style={{color: 'red'}}." },
                            { name: "CSS-in-JS", description: "Dynamic styles." },
                            { name: "Responsive design", description: "Media queries." },
                            { name: "Animations", description: "CSS transitions." },
                            { name: "Icons libraries", description: "lucide-react." }
                        ]
                    }
                ]
            },
            {
                id: 'react-2',
                level: "O'RTA DARAJA",
                color: "bg-blue-50 border-blue-200",
                headerColor: "bg-blue-100",
                sections: [
                    {
                        id: "react-2-1",
                        category: "Advanced Hooks",
                        topics: [
                            { name: "useContext", description: "Global state access." },
                            { name: "useReducer", description: "Complex state." },
                            { name: "useMemo", description: "Memoize values." },
                            { name: "useCallback", description: "Memoize functions." },
                            { name: "useLayoutEffect", description: "DOM mutations." },
                            { name: "useImperativeHandle", description: "Ref forwarding." },
                            { name: "Custom hooks patterns", description: "Reusable logic." },
                            { name: "Hooks rules", description: "Top level only." },
                            { name: "useTransition", description: "Concurrent." },
                            { name: "useDeferredValue", description: "Defer updates." }
                        ]
                    },
                    {
                        id: "react-2-2",
                        category: "Routing",
                        topics: [
                            { name: "React Router v6", description: "Declarative routing." },
                            { name: "BrowserRouter", description: "HTML5 history." },
                            { name: "Routes va Route", description: "Path matching." },
                            { name: "Link va NavLink", description: "Navigation." },
                            { name: "useNavigate", description: "Programmatic nav." },
                            { name: "useParams", description: "Dynamic params." },
                            { name: "useLocation", description: "Current location." },
                            { name: "Nested routes", description: "Child routes." },
                            { name: "Protected routes", description: "Auth guards." },
                            { name: "Code splitting", description: "lazy()." }
                        ]
                    },
                    {
                        id: "react-2-3",
                        category: "State Management",
                        topics: [
                            { name: "Context API", description: "Provider/Consumer." },
                            { name: "Redux Toolkit", description: "Simplified Redux." },
                            { name: "RTK Query", description: "Data fetching." },
                            { name: "Redux Thunk", description: "Async actions." },
                            { name: "Zustand", description: "Simple store." },
                            { name: "Jotai", description: "Atomic state." },
                            { name: "Recoil", description: "Facebook state." },
                            { name: "State patterns", description: "Lifting state." },
                            { name: "Global state", description: "Shared." },
                            { name: "Local state", description: "Component level." }
                        ]
                    },
                    {
                        id: "react-2-4",
                        category: "API Integration",
                        topics: [
                            { name: "Fetch API", description: "Native fetch." },
                            { name: "Axios", description: "Promise HTTP." },
                            { name: "React Query", description: "Data sync." },
                            { name: "SWR", description: "Stale-while-revalidate." },
                            { name: "Error handling", description: "Catch errors." },
                            { name: "Loading states", description: "isLoading." },
                            { name: "Caching", description: "Auto cache." },
                            { name: "Mutations", description: "POST/PUT." },
                            { name: "Optimistic updates", description: "UI first." },
                            { name: "Interceptors", description: "Axios global." }
                        ]
                    },
                    {
                        id: "react-2-5",
                        category: "Testing",
                        topics: [
                            { name: "Jest", description: "Test runner." },
                            { name: "React Testing Library", description: "User-like tests." },
                            { name: "Component testing", description: "render()." },
                            { name: "Hooks testing", description: "renderHook." },
                            { name: "Mocking", description: "jest.mock." },
                            { name: "MSW", description: "Mock service worker." },
                            { name: "Integration tests", description: "Multiple comps." },
                            { name: "E2E: Cypress", description: "Browser tests." },
                            { name: "Coverage", description: "jest --coverage." },
                            { name: "Best practices", description: "Test behavior." }
                        ]
                    },
                    {
                        id: "react-2-6",
                        category: "TypeScript",
                        topics: [
                            { name: "TS basics", description: "Types, interfaces." },
                            { name: "Component typing", description: "FC<Props>." },
                            { name: "Props typing", description: "interface Props {}." },
                            { name: "State typing", description: "useState<Type>()." },
                            { name: "Event types", description: "React.ChangeEvent." },
                            { name: "useRef typing", description: "useRef<Type>()." },
                            { name: "Custom hooks typing", description: "Return types." },
                            { name: "Generics", description: "<T>." },
                            { name: "Type guards", description: "is Type." },
                            { name: "tsconfig setup", description: "Compiler options." }
                        ]
                    }
                ]
            },
            {
                id: 'react-3',
                level: "YUQORI DARAJA",
                color: "bg-purple-50 border-purple-200",
                headerColor: "bg-purple-100",
                sections: [
                    {
                        id: "react-3-1",
                        category: "Advanced Patterns",
                        topics: [
                            { name: "Compound Components", description: "Shared state." },
                            { name: "Render Props", description: "Function as child." },
                            { name: "HOC", description: "Higher-order comp." },
                            { name: "Custom hooks patterns", description: "Logic reuse." },
                            { name: "Container/Presentational", description: "Separation." },
                            { name: "State reducer", description: "Custom reducer." },
                            { name: "Props getter", description: "Prop factories." },
                            { name: "Composition", description: "Children props." },
                            { name: "Inversion of Control", description: "Dependency injection." },
                            { name: "Performance patterns", description: "Memoization." }
                        ]
                    },
                    {
                        id: "react-3-2",
                        category: "React 18+",
                        topics: [
                            { name: "Concurrent rendering", description: "Time slicing." },
                            { name: "useTransition", description: "Low priority updates." },
                            { name: "useDeferredValue", description: "Defer value." },
                            { name: "Suspense", description: "Loading fallback." },
                            { name: "Streaming SSR", description: "Partial render." },
                            { name: "Selective hydration", description: "Priority hydrate." },
                            { name: "Automatic batching", description: "Group updates." },
                            { name: "Server Components", description: "Server-only." },
                            { name: "Actions", description: "Server actions." },
                            { name: "useOptimistic", description: "Optimistic UI." }
                        ]
                    },
                    {
                        id: "react-3-3",
                        category: "Performance",
                        topics: [
                            { name: "React.memo", description: "Shallow compare." },
                            { name: "useMemo/useCallback", description: "Avoid recompute." },
                            { name: "Code splitting", description: "lazy/Suspense." },
                            { name: "Lazy loading", description: "Dynamic import." },
                            { name: "Bundle optimization", description: "Webpack analyze." },
                            { name: "Profiling", description: "React Profiler." },
                            { name: "Virtual scrolling", description: "react-window." },
                            { name: "Debouncing", description: "Input optimize." },
                            { name: "Image optimization", description: "lazy loading." },
                            { name: "Lighthouse", description: "Audit tool." }
                        ]
                    },
                    {
                        id: "react-3-4",
                        category: "Architecture",
                        topics: [
                            { name: "Monorepo", description: "Turborepo." },
                            { name: "Micro-frontends", description: "Module federation." },
                            { name: "Feature structure", description: "By feature." },
                            { name: "DDD", description: "Domain-driven." },
                            { name: "Clean Architecture", description: "Layers." },
                            { name: "SOLID", description: "Principles." },
                            { name: "Design systems", description: "Reusable UI." },
                            { name: "Component library", description: "Storybook." },
                            { name: "Storybook", description: "Component dev." },
                            { name: "Documentation", description: "JSDoc." }
                        ]
                    },
                    {
                        id: "react-3-5",
                        category: "Security & DevOps",
                        topics: [
                            { name: "XSS prevention", description: "React escapes." },
                            { name: "CSRF", description: "Tokens." },
                            { name: "CSP", description: "Content policy." },
                            { name: "Authentication", description: "JWT." },
                            { name: "Docker", description: "Containerize." },
                            { name: "CI/CD", description: "Pipelines." },
                            { name: "GitHub Actions", description: "Workflows." },
                            { name: "Monitoring", description: "Sentry." },
                            { name: "Error tracking", description: "Logs." },
                            { name: "Logging", description: "console vs prod." }
                        ]
                    }
                ]
            }
        ],
        nextjs: [
            {
                id: 'next-1',
                level: "BOSHLANG'ICH DARAJA",
                color: "bg-green-50 border-green-200",
                headerColor: "bg-green-100",
                sections: [
                    {
                        id: "next-1-1",
                        category: "Next.js Asoslari",
                        topics: [
                            { name: "Next.js nima va afzalliklari", description: "Next.js - React framework bo'lib, server-side rendering (SSR), static site generation (SSG) va API routes ni qo'llab-quvvatlaydi. Afzalliklari: Tezlik (built-in optimization), SEO friendly (SSR tufayli), easy deployment (Vercel), hybrid rendering. Ichki mexanizm: Webpack va Babel bilan ishlaydi, automatic code splitting. Real misol: E-commerce saytlarda SSR bilan tez yuklanish. Kam biladigan: Next.js Vercel tomonidan yaratilgan va edge functions support." },
                            { name: "Installation: create-next-app", description: "npx create-next-app@latest app-name – TypeScript, Tailwind, App Router opsiyalari bilan. Ichki: Node.js 18+ kerak, package.json da next, react dependencies. Optimallashtirish: --typescript bilan TS setup. Potentsial xato: Eski Node versiyasi bilan conflict." },
                            { name: "Project structure", description: "pages/ yoki app/ directory, public/ for static, components/. App routerda app/ ichida page.js, layout.js. Ichki: _app.js va _document.js custom uchun. Real misol: src/ folder optional." },
                            { name: "Pages directory routing", description: "File-based: pages/index.js – root, pages/about.js – /about. Dynamic: pages/posts/[id].js." },
                            { name: "File-based routing", description: "Fayl nomi bo'yicha route: folder structure mirrors URL. Ichki: Nested folders for nested routes." },
                            { name: "Link component", description: "import Link from 'next/link'; <Link href='/about'> – Client-side navigation, prefetch." },
                            { name: "Image component", description: "import Image from 'next/image'; Automatic optimization, lazy loading, placeholder." },
                            { name: "Head component", description: "import Head from 'next/head'; Meta tags, title dynamic set." },
                            { name: "Script component", description: "import Script from 'next/script'; Lazy load scripts, strategy: beforeInteractive, afterInteractive." },
                            { name: "Static assets", description: "public/ folderda, /image.png kabi access. No processing." },
                            { name: "Environment variables", description: ".env.local, process.env.VAR. NEXT_PUBLIC_ for client-side." },
                            { name: "Development server", description: "npm run dev – Hot reload, fast refresh." }
                        ]
                    },
                    {
                        id: "next-1-2",
                        category: "Routing Basics",
                        topics: [
                            { name: "Pages va routes", description: "Har bir page.js – route. Index.js default root." },
                            { name: "Dynamic routes: [id]", description: "[id].js – useRouter() dan params olish." },
                            { name: "Nested routes", description: "pages/blog/post.js – /blog/post." },
                            { name: "Catch-all routes: [...slug]", description: "All subpaths capture." },
                            { name: "Optional catch-all: [[...slug]]", description: "Root ham include." },
                            { name: "useRouter hook", description: "import { useRouter } from 'next/router'; router.query." },
                            { name: "router.push, router.replace", description: "Programmatic nav, replace historyni o'zgartirmaydi." },
                            { name: "router.query", description: "Query params va dynamic params." },
                            { name: "Programmatic navigation", description: "router.push('/path?query=val')." },
                            { name: "Shallow routing", description: "URL change without re-fetch." }
                        ]
                    },
                    {
                        id: "next-1-3",
                        category: "Data Fetching (Pages Router)",
                        topics: [
                            { name: "getStaticProps - SSG", description: "Build time data fetch, props return." },
                            { name: "getServerSideProps - SSR", description: "Every request fetch." },
                            { name: "getStaticPaths", description: "Dynamic SSG uchun paths generate." },
                            { name: "Incremental Static Regeneration (ISR)", description: "revalidate bilan background re-gen." },
                            { name: "revalidate option", description: "Seconds after revalidate." },
                            { name: "Client-side fetching", description: "useEffect bilan fetch." },
                            { name: "SWR library", description: "Stale-while-revalidate, caching." },
                            { name: "React Query integration", description: "Data fetching hooks." },
                            { name: "Fallback pages", description: "getStaticPaths fallback: true." },
                            { name: "Preview mode", description: "Draft data for CMS." }
                        ]
                    }
                ]
            },
            {
                id: 'next-2',
                level: "O'RTA DARAJA",
                color: "bg-blue-50 border-blue-200",
                headerColor: "bg-blue-100",
                sections: [
                    {
                        id: "next-2-1",
                        category: "App Router (Next.js 13+)",
                        topics: [
                            { name: "App directory structure", description: "app/ folder, file-based routing with layouts." },
                            { name: "Layout.js va page.js", description: "Shared UI, page content." },
                            { name: "Server Components", description: "Default server-rendered." },
                            { name: "Client Components: 'use client'", description: "Interactivity uchun." },
                            { name: "Route groups: (folder)", description: "URL ga ta'sir qilmaydi." },
                            { name: "Parallel routes: @folder", description: "Multiple pages in one URL." },
                            { name: "Intercepting routes: (.)folder", description: "Modal-like overlays." },
                            { name: "Loading.js va error.js", description: "Suspense boundaries." },
                            { name: "Template.js", description: "Per-navigation remount." },
                            { name: "not-found.js", description: "Custom 404." }
                        ]
                    },
                    {
                        id: "next-2-2",
                        category: "Server Components",
                        topics: [
                            { name: "React Server Components (RSC)", description: "Server-only, no client JS." },
                            { name: "Server vs Client components", description: "Server: DB access, Client: hooks." },
                            { name: "async components", description: "async function Page() {}." },
                            { name: "Streaming", description: "Partial response." },
                            { name: "Suspense boundaries", description: "Fallback while loading." },
                            { name: "Data fetching in RSC", description: "fetch in component." },
                            { name: "fetch() with caching", description: "Next extended fetch." },
                            { name: "Server actions", description: "form action=fn." },
                            { name: "revalidatePath", description: "Path revalidate." },
                            { name: "revalidateTag", description: "Cache tag invalidate." }
                        ]
                    },
                    {
                        id: "next-2-3",
                        category: "API Routes",
                        topics: [
                            { name: "API directory structure", description: "pages/api/ or app/api/." },
                            { name: "Route handlers", description: "export default function handler(req, res) {}." },
                            { name: "GET, POST, PUT, DELETE", description: "req.method check." },
                            { name: "Request va Response objects", description: "Node.js req/res." },
                            { name: "NextRequest, NextResponse", description: "Extended classes." },
                            { name: "Middleware", description: "middleware.js for auth." },
                            { name: "Route segment config", description: "export const dynamic = 'force-dynamic'." },
                            { name: "Dynamic API routes", description: "app/api/[id]/route.js." },
                            { name: "Edge runtime", description: "export const runtime = 'edge'." },
                            { name: "Serverless functions", description: "Auto deploy." }
                        ]
                    },
                    {
                        id: "next-2-4",
                        category: "Styling & UI",
                        topics: [
                            { name: "CSS Modules", description: "file.module.css, scoped." },
                            { name: "Tailwind CSS setup", description: "postcss, tailwind.config.js." },
                            { name: "Global styles", description: "globals.css in root." },
                            { name: "CSS-in-JS", description: "styled-jsx or emotion." },
                            { name: "Sass/SCSS", description: "next-sass." },
                            { name: "Font optimization", description: "next/font/google." },
                            { name: "next/font", description: "Local or Google fonts." },
                            { name: "Image optimization", description: "next/image props." },
                            { name: "Responsive images", description: "sizes, srcSet auto." },
                            { name: "Theme switching", description: "useTheme hook." }
                        ]
                    },
                    {
                        id: "next-2-5",
                        category: "Authentication",
                        topics: [
                            { name: "NextAuth.js", description: "Auth.js now, easy setup." },
                            { name: "Session management", description: "useSession hook." },
                            { name: "JWT tokens", description: "JWT strategy." },
                            { name: "OAuth providers", description: "Google, GitHub." },
                            { name: "Credentials provider", description: "Email/password." },
                            { name: "Protected routes", description: "Middleware or component check." },
                            { name: "Middleware authentication", description: "auth middleware." },
                            { name: "Role-based access", description: "Session roles." },
                            { name: "Cookie management", description: "Secure cookies." },
                            { name: "Security best practices", description: "CSRF, XSS prevent." }
                        ]
                    }
                ]
            },
            {
                id: 'next-3',
                level: "YUQORI DARAJA",
                color: "bg-purple-50 border-purple-200",
                headerColor: "bg-purple-100",
                sections: [
                    {
                        id: "next-3-1",
                        category: "Advanced Rendering",
                        topics: [
                            { name: "Static Site Generation (SSG)", description: "Build time static." },
                            { name: "Server-Side Rendering (SSR)", description: "Request time render." },
                            { name: "Incremental Static Regeneration", description: "Background regen." },
                            { name: "On-demand revalidation", description: "API call regen." },
                            { name: "Streaming SSR", description: "Chunked response." },
                            { name: "Partial prerendering", description: "Static + dynamic mix." },
                            { name: "React Server Components deep dive", description: "RSC payload, tree serialization." },
                            { name: "Client/Server composition", description: "Server holes for client." },
                            { name: "Caching strategies", description: "Router cache, full route cache." },
                            { name: "Edge rendering", description: "CDN edge run." }
                        ]
                    },
                    {
                        id: "next-3-2",
                        category: "Performance Optimization",
                        topics: [
                            { name: "Code splitting", description: "Dynamic imports." },
                            { name: "Dynamic imports", description: "lazy loading." },
                            { name: "Route prefetching", description: "Link prefetch." },
                            { name: "Image optimization", description: "next/image advanced." },
                            { name: "Font optimization", description: "Subset fonts." },
                            { name: "Script optimization", description: "next/script strategy." },
                            { name: "Bundle analysis", description: "@next/bundle-analyzer." },
                            { name: "Core Web Vitals", description: "LCP, FID, CLS measure." },
                            { name: "Lighthouse scores", description: "Audit tool." },
                            { name: "Performance monitoring", description: "Vercel Analytics." }
                        ]
                    },
                    {
                        id: "next-3-3",
                        category: "Middleware",
                        topics: [
                            { name: "Middleware.ts file", description: "Root middleware." },
                            { name: "Request/Response manipulation", description: "Headers add." },
                            { name: "Redirects va rewrites", description: "next.config.js or middleware." },
                            { name: "Geolocation", description: "req.geo." },
                            { name: "A/B testing", description: "Cookie based." },
                            { name: "Feature flags", description: "Dynamic routes." },
                            { name: "Rate limiting", description: "Upstash or custom." },
                            { name: "CORS handling", description: "Headers set." },
                            { name: "Edge middleware", description: "runtime: 'edge'." },
                            { name: "Conditional routing", description: "Based on user." }
                        ]
                    },
                    {
                        id: "next-3-4",
                        category: "Database Integration",
                        topics: [
                            { name: "Prisma ORM", description: "Schema, migrate, query." },
                            { name: "MongoDB integration", description: "Mongoose or native." },
                            { name: "PostgreSQL", description: "pg or Prisma." },
                            { name: "Supabase", description: "Auth + DB." },
                            { name: "PlanetScale", description: "Serverless MySQL." },
                            { name: "Connection pooling", description: "pg-pool." },
                            { name: "Data mutations", description: "Server actions." },
                            { name: "Server actions with DB", description: "async actions." },
                            { name: "Edge database", description: "Vercel Postgres." },
                            { name: "Database migrations", description: "Prisma migrate." }
                        ]
                    },
                    {
                        id: "next-3-5",
                        category: "Deployment & Production",
                        topics: [
                            { name: "Vercel deployment", description: "Git push deploy." },
                            { name: "Environment variables", description: "Vercel dashboard." },
                            { name: "Build optimization", description: "next.config.js." },
                            { name: "Docker containerization", description: "Dockerfile for Next." },
                            { name: "Self-hosting", description: "Node server." },
                            { name: "CDN configuration", description: "Vercel CDN." },
                            { name: "Edge functions", description: "Middleware edge." },
                            { name: "Monitoring: Sentry", description: "Error tracking." },
                            { name: "Analytics", description: "Vercel or GA." },
                            { name: "Error tracking", description: "Sentry integration." }
                        ]
                    },
                    {
                        id: "next-3-6",
                        category: "Advanced Patterns",
                        topics: [
                            { name: "Monorepo with Turborepo", description: "Multi-package." },
                            { name: "Micro-frontends", description: "Module federation." },
                            { name: "Internationalization (i18n)", description: "next-intl." },
                            { name: "Multi-tenancy", description: "Subdomains." },
                            { name: "E-commerce patterns", description: "Shopify integration." },
                            { name: "CMS integration", description: "Contentful, Sanity." },
                            { name: "GraphQL integration", description: "Apollo." },
                            { name: "WebSockets", description: "Socket.io." },
                            { name: "Real-time features", description: "Pusher." },
                            { name: "Progressive Web App", description: "next-pwa." }
                        ]
                    }
                ]
            }
        ],
        typescript: [
            {
                id: 'ts-1',
                level: "BOSHLANG'ICH DARAJA",
                color: "bg-indigo-50 border-indigo-200",
                headerColor: "bg-indigo-100",
                sections: [
                    {
                        id: "ts-1-1",
                        category: "Introduction and Setup",
                        topics: [
                            { name: "What is TypeScript?", description: "TypeScript - JavaScript superset, static typing qo'shadi. Compile time errors, better tooling (IntelliSense). Ichki mexanizm: tsc compiler JS ga transpile qiladi, types runtime da yo'qoladi. Optimallashtirish: TS JS ni yaxshilaydi, lekin bundle size oshmaydi. Potentsial xato: JS code ni TS ga migrate qilishda any ishlatish. Real misol: Large projects like Angular, React apps da ishlatiladi. Kam biladigan: Microsoft tomonidan yaratilgan, ECMAScript ga asoslangan." },
                            { name: "Benefits over JavaScript", description: "Early error detection, self-documenting code, refactoring easy. Real-world: Team collaboration da types contract kabi ishlaydi." },
                            { name: "Use-Cases & Compilation", description: "Web, Node.js, React, Angular. tsc file.ts – JS ga compile." },
                            { name: "TypeScript vs JavaScript", description: "TS - typed, JS - dynamic. TS JS ga compile bo'ladi." },
                            { name: "Install TypeScript globally", description: "npm i -g typescript. tsc --version." },
                            { name: "Local project setup with tsc", description: "npm init, npm i --dev typescript, tsc --init." },
                            { name: "tsconfig.json explained", description: "Compiler options: target, module, strict, outDir. Ichki: JSON file, extends support." },
                            { name: "Compile .ts to .js", description: "tsc file.ts or tsc --watch." },
                            { name: "Use ts-node, nodemon", description: "ts-node for direct run, nodemon for watch." }
                        ]
                    },
                    {
                        id: "ts-1-2",
                        category: "Type System Basics",
                        topics: [
                            { name: "Primitive Types: string, number, boolean, null, undefined, symbol, bigint", description: "string: let s: string = 'hello'; number: let n: number = 42; boolean: let b: boolean = true; null/undefined: explicit types. symbol: unique keys. bigint: big numbers 1n. Ichki: Inference auto detect qiladi, lekin explicit better for clarity. Xato: Type mismatch compile error." },
                            { name: "Non-Primitive Types: object, array, function, tuple, map, set, class, interface", description: "object: let o: object = {}; array: let a: number[] = [1,2]; function: let f: (x: number) => string; tuple: let t: [number, string] = [1, 'a']; map/set: new Map<string, number>(); class/interface: structured types." },
                            { name: "Special Types: any, unknown, void, never", description: "any: type checking off, avoid. unknown: safer any, type check kerak. void: no return. never: never reaches, throw or infinite loop." }
                        ]
                    },
                    {
                        id: "ts-1-3",
                        category: "Type Annotations & Inference",
                        topics: [
                            { name: "Variable annotations", description: "let x: number = 5; Explicit type." },
                            { name: "Function params & return types", description: "function add(a: number, b: number): number {}." },
                            { name: "Array & object typing", description: "let arr: string[]; let obj: {key: string}." },
                            { name: "Type inference and best practices", description: "TS auto infer qiladi, lekin complex da explicit ishlat." }
                        ]
                    },
                    {
                        id: "ts-1-4",
                        category: "Type Aliases, Union & Intersection",
                        topics: [
                            { name: "type keyword", description: "type Alias = number | string;" },
                            { name: "Union ( | ) and Intersection ( & ) types", description: "Union: multiple types, intersection: all properties." },
                            { name: "Literal types", description: "type Dir = 'up' | 'down';." },
                            { name: "Reusability with aliases", description: "Complex types reuse." }
                        ]
                    }
                ]
            },
            {
                id: 'ts-2',
                level: "O'RTA DARAJA",
                color: "bg-blue-50 border-blue-200",
                headerColor: "bg-blue-100",
                sections: [
                    {
                        id: "ts-2-1",
                        category: "Interfaces",
                        topics: [
                            { name: "Basic interface", description: "interface User { name: string; }." },
                            { name: "Optional/readonly properties", description: "age?: number; readonly id: number." },
                            { name: "Function types", description: "interface Fn { (x: number): void; }." },
                            { name: "Extending interfaces", description: "interface Admin extends User { role: string; }." },
                            { name: "Index signatures & merging", description: "[key: string]: any; Multiple declarations merge." },
                            { name: "Interface vs Type", description: "Interface extend easy, type aliases more flexible for unions." }
                        ]
                    },
                    {
                        id: "ts-2-2",
                        category: "Enums & Literal Types",
                        topics: [
                            { name: "Numeric & string enums", description: "enum Color { Red = 1, Green } or enum Dir { Up = 'UP' }." },
                            { name: "Const enums", description: "const enum – compile time only." },
                            { name: "Literal types for constraints", description: "let dir: 'up' | 'down'." }
                        ]
                    },
                    {
                        id: "ts-2-3",
                        category: "Arrays & Tuples",
                        topics: [
                            { name: "Typed arrays", description: "let arr: Array<number> or number[]." },
                            { name: "Tuples with fixed types & lengths", description: "let t: [string, number] = ['a', 1];." },
                            { name: "Optional tuple elements", description: "let t: [string, number?] = ['a'];." }
                        ]
                    },
                    {
                        id: "ts-2-4",
                        category: "Functions in TypeScript",
                        topics: [
                            { name: "Function types", description: "let fn: (a: number) => void." },
                            { name: "Optional & default parameters", description: "b?: number, c = 1." },
                            { name: "Function overloads", description: "Multiple signatures for one function." },
                            { name: "Arrow functions", description: "const add = (a: number, b: number) => a + b." },
                            { name: "this context in TS", description: "Arrow for lexical this." }
                        ]
                    },
                    {
                        id: "ts-2-5",
                        category: "Utility Types",
                        topics: [
                            { name: "Partial", description: "Partial<Type> – all optional." },
                            { name: "Required", description: "Required<Type> – all required." },
                            { name: "Readonly", description: "Readonly<Type> – readonly props." },
                            { name: "Pick", description: "Pick<Type, 'key1' | 'key2'>." },
                            { name: "Omit", description: "Omit<Type, 'key'>." },
                            { name: "Record", description: "Record<Keys, Type> – object with keys." },
                            { name: "ReturnType", description: "ReturnType<typeof fn>." },
                            { name: "Parameters", description: "Parameters<typeof fn>." },
                            { name: "Exclude", description: "Exclude<Union, Excluded>." },
                            { name: "Extract", description: "Extract<Union, Extracted>." }
                        ]
                    },
                    {
                        id: "ts-2-6",
                        category: "Classes & OOP",
                        topics: [
                            { name: "Class declaration", description: "class Person { name: string; }." },
                            { name: "Access modifiers: public, private, protected", description: "public default, private class ichida, protected inheritance." },
                            { name: "readonly, static, and this", description: "readonly init after change yo'q, static class level." },
                            { name: "Inheritance", description: "class Child extends Parent {}." },
                            { name: "Method overriding", description: "Same name in child." },
                            { name: "Polymorphism", description: "Different forms." }
                        ]
                    },
                    {
                        id: "ts-2-7",
                        category: "Abstract Classes & Polymorphism",
                        topics: [
                            { name: "Abstract classes = blueprint/template", description: "abstract class Shape { abstract draw(): void; }." },
                            { name: "Abstract methods", description: "Must implement in child." },
                            { name: "Real-world examples", description: "Base class for shapes." }
                        ]
                    },
                    {
                        id: "ts-2-8",
                        category: "Generics",
                        topics: [
                            { name: "Generic functions <T>", description: "function identity<T>(arg: T): T {}." },
                            { name: "Generic classes & interfaces", description: "class Box<T> { value: T; }." },
                            { name: "Constraints ( <T extends ...> )", description: "T extends Lengthwise." },
                            { name: "Default generic values", description: "<T = string>." }
                        ]
                    }
                ]
            },
            {
                id: 'ts-3',
                level: "YUQORI DARAJA",
                color: "bg-purple-50 border-purple-200",
                headerColor: "bg-purple-100",
                sections: [
                    {
                        id: "ts-3-1",
                        category: "Advanced Types",
                        topics: [
                            { name: "Type guards ( typeof, instanceof )", description: "if (typeof x === 'string') – narrow type." },
                            { name: "Discriminated union types", description: "Union with kind property." },
                            { name: "keyof, typeof, in, as", description: "keyof Type – keys union, typeof for type from value." },
                            { name: "Conditional types", description: "T extends U ? X : Y." },
                            { name: "Template literal types", description: "type Msg = `Hello ${string}`." },
                            { name: "Recursive types", description: "interface Tree { children: Tree[]; }." }
                        ]
                    },
                    {
                        id: "ts-3-2",
                        category: "Modules & Namespaces",
                        topics: [
                            { name: "import, export, file structure", description: "export const x; import {x} from './file'." },
                            { name: "Aliases and grouping", description: "import * as mod from './'; export {a as b}." },
                            { name: "Legacy namespace support", description: "namespace MyNs { export const x; }." }
                        ]
                    },
                    {
                        id: "ts-3-3",
                        category: "Declaration Files (.d.ts)",
                        topics: [
                            { name: "Writing and using .d.ts", description: "declare module 'mod' { export interface I {} }." },
                            { name: "Global types", description: "declare global { interface Window { prop: string; } }." },
                            { name: "Third-party libraries ( @types/... )", description: "npm i @types/react." }
                        ]
                    },
                    {
                        id: "ts-3-4",
                        category: "DOM with TypeScript",
                        topics: [
                            { name: "HTMLElement, HTMLInputElement, Event types", description: "let el: HTMLElement = document.getElementById('id')!;." },
                            { name: "querySelector, addEventListener", description: "document.querySelector('div') as HTMLDivElement." },
                            { name: "Safe DOM access, assertions", description: "if (el) el.textContent = 'hi'; or ! for non-null." }
                        ]
                    },
                    {
                        id: "ts-3-5",
                        category: "Working with Frameworks",
                        topics: [
                            { name: "React + TS", description: "interface Props { name: string; }, FC<Props>." },
                            { name: "Props, state, events", description: "useState<string>(''); onClick: MouseEventHandler." },
                            { name: "Custom types for components", description: "type MyCompProps = {}." },
                            { name: "useState, useRef, useEffect with types", description: "useRef<HTMLDivElement>(null)." },
                            { name: "Node.js + Express", description: "app.get('/', (req: Request, res: Response) => {})." },
                            { name: "Typed route handlers", description: "Middleware: NextFunction." },
                            { name: "Middleware typing", description: "Typed req, res, next." },
                            { name: "Typed request, response, next", description: "@types/express." }
                        ]
                    },
                    {
                        id: "ts-3-6",
                        category: "Best Practices",
                        topics: [
                            { name: "When to use interface vs type", description: "Interface for objects, type for primitives/unions." },
                            { name: "Avoiding any, preferring unknown", description: "unknown for safe casting." },
                            { name: "Breaking large types into modules", description: "Export types from files." },
                            { name: "Consistent type declaration styles", description: "Always use strict mode." }
                        ]
                    },
                    {
                        id: "ts-3-7",
                        category: "Projects & Practice",
                        topics: [
                            { name: "Todo App with full type safety", description: "Typed state, props." },
                            { name: "Auth System (JWT + Express)", description: "Typed tokens, users." },
                            { name: "Axios API Client using generics", description: "Generic fetch function." },
                            { name: "Form Validator (DOM + Utility types)", description: "Type guards for inputs." },
                            { name: "Blog CRUD (Node + TS)", description: "Typed DB models." }
                        ]
                    },
                    {
                        id: "ts-3-8",
                        category: "Interview Questions & MCQs",
                        topics: [
                            { name: "interface vs type", description: "Interface mergable, type not." },
                            { name: "never vs void", description: "never – no value, void – undefined." },
                            { name: "unknown vs any", description: "unknown safe, any dangerous." },
                            { name: "Real-world patterns and best practices", description: "Generics in libs." },
                            { name: "Type system deep dive", description: "Inference mechanics." }
                        ]
                    }
                ]
            }
        ],

        english: [
            {
                "beginner": {
                    "level": "BEGINNER (A1-A2)",
                    "duration": "Month 1 (Weeks 1-4)",
                    "modules": [
                        {
                            "module": "Alphabet & Phonics",
                            "week": "Week 1",
                            "topics": [
                                {
                                    "title": "26 Letters & Sounds",
                                    "description": "Learn English alphabet uppercase and lowercase letters with pronunciation.",
                                    "details": "Practice: A-Z recognition, writing practice, letter sounds (phonics). Focus on correct pronunciation of each letter. Vowels (a, e, i, o, u) vs consonants. Resources: Alphabet songs, flashcards, writing worksheets."
                                },
                                {
                                    "title": "Basic Phonics Rules",
                                    "description": "Letter combinations and their sounds: ch, sh, th, ph, etc.",
                                    "details": "Silent letters, double consonants, vowel combinations (ea, oo, ai). Practice reading simple CVC words (cat, dog, pen). Blending sounds to form words. Common digraphs and trigraphs."
                                },
                                {
                                    "title": "Basic Pronunciation",
                                    "description": "Correct pronunciation of common English sounds.",
                                    "details": "Difficult sounds for non-natives: /θ/ (think), /ð/ (this), /r/, /l/, /v/, /w/. Mouth position, tongue placement. Practice with minimal pairs (ship/sheep, bit/beat). Record and compare with natives."
                                }
                            ]
                        },
                        {
                            "module": "Basic Greetings & Numbers",
                            "week": "Week 1",
                            "topics": [
                                {
                                    "title": "Simple Greetings",
                                    "description": "Hello, Hi, Good morning/afternoon/evening, Goodbye, See you",
                                    "details": "Formal vs informal greetings. How are you? - I'm fine, thank you. Nice to meet you. Context-appropriate responses. Cultural differences in greetings."
                                },
                                {
                                    "title": "Numbers 1-100",
                                    "description": "Cardinal numbers for counting, age, phone numbers.",
                                    "details": "0-20: individual numbers. 20-100: patterns (twenty-one, thirty-five). Pronunciation: thirteen vs thirty. Ordinal numbers basics (1st, 2nd, 3rd). Practice: counting, phone numbers, prices."
                                },
                                {
                                    "title": "Days, Months, Seasons",
                                    "description": "Days of the week, months of the year, four seasons.",
                                    "details": "Monday-Sunday (capitalization). January-December. Spring, Summer, Autumn/Fall, Winter. Common expressions: 'on Monday', 'in January', 'in summer'. Date formats: British vs American."
                                },
                                {
                                    "title": "Colors & Basic Adjectives",
                                    "description": "Common colors and simple descriptive words.",
                                    "details": "Primary colors: red, blue, yellow. Secondary: green, orange, purple. Black, white, gray, brown, pink. Size: big, small, tall, short. Quality: good, bad, nice, beautiful, ugly."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Verb 'to be'",
                            "week": "Week 1",
                            "topics": [
                                {
                                    "title": "Present Simple: am, is, are",
                                    "description": "Basic sentence structure with 'to be' verb.",
                                    "details": "Positive: I am, You are, He/She/It is, We/You/They are. Negative: I'm not, isn't, aren't. Questions: Am I? Is he? Are they? Contractions: I'm, you're, he's, she's, it's, we're, they're. Short answers: Yes, I am / No, I'm not."
                                },
                                {
                                    "title": "Personal Information",
                                    "description": "Introduce yourself: name, age, nationality, job.",
                                    "details": "My name is... I'm ... years old. I'm from... I'm a student/teacher. Practice: full sentences about yourself. Asking others: What's your name? Where are you from? How old are you?"
                                },
                                {
                                    "title": "This/That, These/Those",
                                    "description": "Demonstrative pronouns with singular and plural nouns.",
                                    "details": "This is (near, singular), That is (far, singular). These are (near, plural), Those are (far, plural). This is my book. Those are her shoes. Questions: What's this? What are these?"
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Present Simple",
                            "week": "Week 2",
                            "topics": [
                                {
                                    "title": "Present Simple Structure",
                                    "description": "I/You/We/They + base verb, He/She/It + verb+s",
                                    "details": "Positive: I work, He works. Negative: I don't work, He doesn't work. Questions: Do you work? Does he work? Third person -s rules: adds -s (works), -es (watches, goes), -ies (studies). Spelling rules."
                                },
                                {
                                    "title": "Time Expressions",
                                    "description": "Adverbs of frequency and time markers.",
                                    "details": "Always (100%), usually (80%), often (60%), sometimes (40%), rarely (20%), never (0%). Every day/week/month/year. On Mondays. In the morning/afternoon/evening. At night. Position in sentence."
                                },
                                {
                                    "title": "Daily Routines",
                                    "description": "Common verbs for everyday activities.",
                                    "details": "Wake up, get up, brush teeth, have breakfast, go to work/school, have lunch, come home, do homework, watch TV, go to bed. Time: I wake up at 7 o'clock. Practice describing your daily routine."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Basic Words (100)",
                            "week": "Week 2",
                            "topics": [
                                {
                                    "title": "Family Members",
                                    "description": "Father, mother, brother, sister, son, daughter, etc.",
                                    "details": "Immediate family: parents, siblings, children. Extended family: grandparents, uncle, aunt, cousin. Husband, wife. Possessive: my father, her mother, his brother. Family tree practice."
                                },
                                {
                                    "title": "Body Parts",
                                    "description": "Head, eyes, nose, mouth, ears, arms, legs, hands, feet, etc.",
                                    "details": "Face: eyes, nose, mouth, ears, teeth, hair. Body: head, neck, shoulders, chest, stomach, back. Limbs: arms, hands, fingers, legs, feet, toes. Plurals: tooth-teeth, foot-feet."
                                },
                                {
                                    "title": "House & Rooms",
                                    "description": "Living room, bedroom, kitchen, bathroom, garden, etc.",
                                    "details": "Rooms: bedroom, living room, dining room, kitchen, bathroom, toilet, garage. Furniture: bed, table, chair, sofa, TV, lamp. Prepositions: in the kitchen, on the table, under the bed."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Articles & Pronouns",
                            "week": "Week 3",
                            "topics": [
                                {
                                    "title": "Articles: a, an, the",
                                    "description": "Indefinite (a/an) and definite (the) articles.",
                                    "details": "A: before consonant sounds (a book, a university). An: before vowel sounds (an apple, an hour). The: specific/known items (the book on the table). No article: general plurals/uncountables (I like cats)."
                                },
                                {
                                    "title": "Subject Pronouns",
                                    "description": "I, you, he, she, it, we, they",
                                    "details": "Replace subject nouns: John = he, Mary = she, the dog = it, my friends = they. Usage in sentences: He is tall. They are students. Practice substitution exercises."
                                },
                                {
                                    "title": "Object Pronouns",
                                    "description": "me, you, him, her, it, us, them",
                                    "details": "After verbs/prepositions: I see him. She loves me. Come with us. Difference from subject: I (subject) vs me (object). Practice: She helps me. I call him."
                                },
                                {
                                    "title": "Possessive Adjectives",
                                    "description": "my, your, his, her, its, our, their",
                                    "details": "Before nouns: my book, his car, their house. Agreement: I-my, you-your, he-his, she-her, it-its, we-our, they-their. Practice: This is my pen. That's her bag."
                                },
                                {
                                    "title": "Possessive Pronouns",
                                    "description": "mine, yours, his, hers, ours, theirs",
                                    "details": "Replace possessive adjective + noun: This book is mine (=my book). That car is yours. Stand alone. Practice: Whose is this? It's mine."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Food & Clothes (150 words)",
                            "week": "Week 3",
                            "topics": [
                                {
                                    "title": "Food & Drinks",
                                    "description": "Common foods and beverages.",
                                    "details": "Food: bread, rice, meat, fish, chicken, eggs, cheese, vegetables, fruit. Drinks: water, milk, juice, tea, coffee, soda. Meals: breakfast, lunch, dinner. I like... I don't like..."
                                },
                                {
                                    "title": "Clothes & Accessories",
                                    "description": "Clothing items and accessories.",
                                    "details": "Clothes: shirt, T-shirt, pants, jeans, dress, skirt, jacket, coat, shoes, socks. Accessories: hat, cap, glasses, watch, bag. Colors + clothes: a blue shirt, red shoes. Wear/put on."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Present Continuous",
                            "week": "Week 4",
                            "topics": [
                                {
                                    "title": "Present Continuous Structure",
                                    "description": "am/is/are + verb-ing for actions happening now.",
                                    "details": "Positive: I am working, He is eating. Negative: I'm not working, She isn't eating. Questions: Are you working? What are you doing? Spelling: -ing rules (work-working, run-running, write-writing)."
                                },
                                {
                                    "title": "Present Simple vs Continuous",
                                    "description": "Habits vs current actions.",
                                    "details": "Simple: routines, habits, facts (I work every day). Continuous: now, temporary (I'm working now). Time markers: Simple (usually, always), Continuous (now, at the moment, right now). Stative verbs: like, love, want, know, understand (no continuous)."
                                },
                                {
                                    "title": "Stative Verbs",
                                    "description": "Verbs not used in continuous form.",
                                    "details": "Mental states: know, understand, believe, think (opinion), remember. Emotions: like, love, hate, want, need, prefer. Senses: see, hear, smell, taste (involuntary). Possession: have, own, belong. Use simple: I know the answer (NOT I'm knowing)."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Actions, Sports, Hobbies (200 words)",
                            "week": "Week 4",
                            "topics": [
                                {
                                    "title": "Action Verbs",
                                    "description": "Common action verbs for daily activities.",
                                    "details": "Run, walk, jump, swim, eat, drink, sleep, read, write, study, play, work, cook, clean, drive, ride. Present continuous practice: I'm running. She's reading. They're playing."
                                },
                                {
                                    "title": "Sports & Hobbies",
                                    "description": "Sports activities and leisure pursuits.",
                                    "details": "Sports: football/soccer, basketball, tennis, swimming, running, cycling. Hobbies: reading, watching TV, listening to music, playing games, drawing, cooking. Play (sports), do (yoga), go (swimming). Expressions: in my free time, I enjoy..."
                                },
                                {
                                    "title": "Basic Phrasal Verbs (10)",
                                    "description": "Common phrasal verbs for beginners.",
                                    "details": "Get up, wake up, sit down, stand up, turn on, turn off, pick up, put down, look at, listen to. Practice in sentences: I get up at 7. Turn off the TV. Look at this!"
                                }
                            ]
                        },
                        {
                            "module": "IELTS Introduction",
                            "week": "Week 4",
                            "topics": [
                                {
                                    "title": "IELTS Format Overview",
                                    "description": "Understanding the 4 sections of IELTS.",
                                    "details": "Listening (30 min + 10 transfer): 4 parts, 40 questions. Reading (60 min): 3 passages, 40 questions. Writing (60 min): Task 1 (150 words, 20 min), Task 2 (250 words, 40 min). Speaking (11-14 min): Part 1, 2, 3. Band scores: 0-9."
                                },
                                {
                                    "title": "Band Score Descriptors",
                                    "description": "What each band score means (1-9).",
                                    "details": "Band 9: Expert user. Band 7-8: Good/Very good user. Band 5-6: Modest/Competent user. Band 4: Limited user. Assessment criteria: Listening/Reading (correct answers), Writing/Speaking (4 criteria each)."
                                },
                                {
                                    "title": "Study Plan & Resources",
                                    "description": "How to prepare effectively.",
                                    "details": "Cambridge IELTS books (14-19), Official practice tests, Online resources (IELTS Liz, Simon), Apps (IELTS Prep), Daily practice schedule, Mock tests weekly. Understand question types in each section."
                                }
                            ]
                        }
                    ]
                },
            },
            {
                "intermediate": {
                    "level": "INTERMEDIATE (B1-B2)",
                    "duration": "Months 2-3 (Weeks 5-12)",
                    "modules": [
                        {
                            "module": "Grammar: Past Simple",
                            "week": "Week 5",
                            "topics": [
                                {
                                    "title": "Past Simple: Regular Verbs",
                                    "description": "Base verb + -ed for regular verbs.",
                                    "details": "Positive: I worked, She played. Negative: I didn't work, He didn't play. Questions: Did you work? Where did she go? Spelling rules: -ed (work-worked), double consonant (stop-stopped), -ied (study-studied). Pronunciation: /t/, /d/, /ɪd/ sounds."
                                },
                                {
                                    "title": "Past Simple: Irregular Verbs",
                                    "description": "100 common irregular verbs - must memorize.",
                                    "details": "go-went, have-had, do-did, make-made, take-took, come-came, see-saw, get-got, give-gave, find-found, etc. Learn in groups: vowel change (sing-sang), same form (put-put), completely different (go-went). Practice daily. Use in sentences."
                                },
                                {
                                    "title": "Past Time Expressions",
                                    "description": "Yesterday, last week/month/year, ago, in 2020.",
                                    "details": "Yesterday morning/afternoon/evening. Last night, last Monday, last summer. 2 days/weeks/years ago. In the past, when I was young. Practice: I went to Paris last year. She called me 2 hours ago."
                                },
                                {
                                    "title": "Past Simple: used to",
                                    "description": "Past habits that are no longer true.",
                                    "details": "I used to play football (but now I don't). Positive: used to + base verb. Negative: didn't use to. Questions: Did you use to...? Difference from past simple: used to = repeated past habits."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Collocations (250 words)",
                            "week": "Week 5",
                            "topics": [
                                {
                                    "title": "Common Collocations",
                                    "description": "Word combinations that naturally go together.",
                                    "details": "Verb + noun: make a decision, take a break, do homework, have a shower, catch a cold, miss a chance. Adjective + noun: strong coffee, heavy rain, deep sleep. Learn as chunks, not individual words."
                                },
                                {
                                    "title": "Topic Vocabulary: Travel, Education, Work",
                                    "description": "Expanded vocabulary for common topics.",
                                    "details": "Travel: airport, flight, hotel, tourist, suitcase, journey, passenger. Education: student, teacher, exam, subject, homework, degree, university. Work: job, career, salary, boss, colleague, office, meeting. Practice in context."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Skills: Listening & Speaking Part 1",
                            "week": "Week 5",
                            "topics": [
                                {
                                    "title": "IELTS Listening Part 1",
                                    "description": "Conversation in everyday social context.",
                                    "details": "Form filling, note completion, table completion. Focus: names, dates, times, addresses, numbers. Practice spelling, British vs American accents. Note-taking techniques. Common traps: similar sounds, distractors."
                                },
                                {
                                    "title": "IELTS Speaking Part 1",
                                    "description": "Introduction and familiar topics (4-5 minutes).",
                                    "details": "Questions about yourself, home, family, work, studies, hobbies, interests. Answer fully: extend beyond yes/no. Use present simple/continuous. Practice common topics: hometown, accommodation, work/study, hobbies, food, family."
                                },
                                {
                                    "title": "IELTS Reading: Short Passages",
                                    "description": "Basic reading comprehension practice.",
                                    "details": "Skimming: get main idea quickly. Scanning: find specific information. Question types: multiple choice, true/false, matching. Build reading speed gradually. Academic vs General Training differences."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Future Forms",
                            "week": "Week 6",
                            "topics": [
                                {
                                    "title": "Will vs Going to",
                                    "description": "Two ways to express future.",
                                    "details": "Will: spontaneous decisions (I'll help you), predictions based on opinion (It will rain). Going to: plans/intentions (I'm going to study medicine), predictions based on evidence (Look at those clouds! It's going to rain). Practice contexts."
                                },
                                {
                                    "title": "Present Continuous for Future",
                                    "description": "Arranged plans and appointments.",
                                    "details": "I'm meeting John tomorrow (arranged). She's flying to London next week. With future time markers: tomorrow, next week, tonight. More certain than 'going to'. Calendar/diary arrangements."
                                },
                                {
                                    "title": "Future Time Clauses",
                                    "description": "When, as soon as, before, after, until + present simple.",
                                    "details": "I'll call you when I arrive (NOT when I will arrive). After she finishes work, she'll go home. We'll wait until he comes. As soon as I get home, I'll start cooking. No future in time clause!"
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Weather, Travel, Jobs (300 words)",
                            "week": "Week 6",
                            "topics": [
                                {
                                    "title": "Weather Vocabulary",
                                    "description": "Describing weather conditions.",
                                    "details": "Sunny, cloudy, rainy, snowy, windy, foggy, hot, cold, warm, cool. It's raining/snowing. The sun is shining. Temperature: degrees Celsius/Fahrenheit. Forecast: It will be sunny tomorrow."
                                },
                                {
                                    "title": "Jobs & Professions",
                                    "description": "Common occupations and work-related terms.",
                                    "details": "Doctor, nurse, teacher, engineer, lawyer, accountant, manager, salesperson, waiter, chef, programmer. Work places: hospital, school, office, restaurant. Questions: What do you do? Where do you work? What's your job?"
                                },
                                {
                                    "title": "Academic Word List - Introduction (50 words)",
                                    "description": "Start learning academic vocabulary for IELTS.",
                                    "details": "analyze, approach, area, assess, assume, authority, available, benefit, concept, consist, constitute, context, contract, create, data, definition, derive, distribute, economic, environment. Study in context, not in isolation."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Skills: Writing Task 1 Introduction",
                            "week": "Week 6",
                            "topics": [
                                {
                                    "title": "Writing Task 1: Overview",
                                    "description": "Describing visual information (Academic IELTS).",
                                    "details": "Graph types: line graph, bar chart, pie chart, table, diagram, map. 150 words minimum, 20 minutes. Structure: Introduction (paraphrase), Overview (main trends), Details (specific data). No opinion."
                                },
                                {
                                    "title": "Task 1: Introduction & Overview",
                                    "description": "How to start your Task 1 response.",
                                    "details": "Introduction: Paraphrase the question. The graph shows... The chart illustrates... The table presents... Overview: General trends, highest/lowest, main features. No specific data in overview."
                                },
                                {
                                    "title": "IELTS Listening Part 2",
                                    "description": "Monologue in everyday social context.",
                                    "details": "One person speaking: tour guide, radio announcement, speech. Note completion, sentence completion, multiple choice. Practice listening for specific information. Topic: public places, events, services."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Modal Verbs (1)",
                            "week": "Week 7",
                            "topics": [
                                {
                                    "title": "Can, Could, May, Might",
                                    "description": "Ability, possibility, and permission.",
                                    "details": "Can: ability (I can swim), permission (Can I go?). Could: past ability (I could swim when I was 5), polite request (Could you help?). May/Might: possibility (It may/might rain). Degrees of certainty: must > will > could/may/might."
                                },
                                {
                                    "title": "Must, Have to, Should",
                                    "description": "Obligation, necessity, and advice.",
                                    "details": "Must: strong obligation (You must stop at red lights), personal opinion. Have to: external obligation (I have to go to work). Should: advice (You should study more). Negative: mustn't (prohibition), don't have to (no necessity)."
                                },
                                {
                                    "title": "Modal Verbs for Advice",
                                    "description": "Should, ought to, had better.",
                                    "details": "Should/Ought to: general advice (You should see a doctor). Had better: stronger advice, warning (You'd better leave now or you'll be late). Practice: health problems, life situations, recommendations."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Synonyms, Antonyms, Academic Words (350 words)",
                            "week": "Week 7",
                            "topics": [
                                {
                                    "title": "Synonyms for Paraphrasing",
                                    "description": "Different words with similar meanings.",
                                    "details": "Important-significant-crucial. Big-large-huge. Show-demonstrate-illustrate. Increase-rise-grow. Decrease-decline-fall. Essential for IELTS paraphrasing. Practice rewriting sentences with synonyms."
                                },
                                {
                                    "title": "Antonyms",
                                    "description": "Opposite meanings for contrast.",
                                    "details": "Increase-decrease, advantage-disadvantage, positive-negative, modern-traditional, urban-rural. Use in comparisons and contrasts. Practice: Both X and Y, but while X is..., Y is..."
                                },
                                {
                                    "title": "Academic Vocabulary (50 more words)",
                                    "description": "Expanding academic word knowledge to 100 total.",
                                    "details": "achieve, acquire, affect, alternative, appropriate, circumstance, clarify, comment, compensate, component, concentrate, conclude, conduct, consequent, considerable, constant, demonstrate, demonstrate, design, despite, dimension, distinct, element, emphasize, ensure, establish, estimate, evaluate, evident, factor, feature, final, focus, function, generate, identify, illustrate, image, impact, implement, imply, initial, instance, integrate, interpret, involve, issue."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Skills: Speaking Part 2 & Reading",
                            "week": "Week 7",
                            "topics": [
                                {
                                    "title": "IELTS Speaking Part 2: Cue Card",
                                    "description": "2-minute individual long turn.",
                                    "details": "Receive topic card, 1 minute preparation, speak for 2 minutes. Structure: Introduction, Main points (who, what, when, where, why), Conclusion. Practice topics: person, place, object, event, experience. Note-taking strategy during prep time."
                                },
                                {
                                    "title": "IELTS Reading: Multiple Choice",
                                    "description": "Choosing correct answer from options.",
                                    "details": "Skim question, identify keywords, scan passage for keywords/synonyms. Eliminate wrong answers. Watch for: synonyms (big=large), paraphrases, distractors (words from passage but wrong context). Time management: don't spend too long on one question."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Present Perfect",
                            "week": "Week 8",
                            "topics": [
                                {
                                    "title": "Present Perfect Structure",
                                    "description": "have/has + past participle",
                                    "details": "Positive: I have worked, She has finished. Negative: I haven't worked, He hasn't finished. Questions: Have you worked? Has she finished? Irregular past participles: been, gone, done, seen, eaten. Regular: -ed form."
                                },
                                {
                                    "title": "Present Perfect Uses",
                                    "description": "Life experience, unfinished time, recent past, change.",
                                    "details": "Life experience: I have visited Paris (sometime in my life). Unfinished time: I have lived here for 5 years (still living). Recent past: She has just arrived. Change: He has lost weight. Ever, never, already, yet, just, still."
                                },
                                {
                                    "title": "Present Perfect vs Past Simple",
                                    "description": "Key difference: finished vs unfinished time.",
                                    "details": "Present Perfect: unspecified/unfinished time (I have seen that movie). Past Simple: specific finished time (I saw that movie yesterday). Time markers: PP (ever, never, already, yet, for, since, recently), PS (yesterday, ago, last, in 2020)."
                                },
                                {
                                    "title": "For vs Since",
                                    "description": "Duration vs starting point.",
                                    "details": "For + period of time (for 3 years, for 2 months, for a long time). Since + point in time (since 2020, since Monday, since I was a child). I have studied English for 5 years / since 2018. Questions: How long have you...?"
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Idioms (20) & Topic Words (400 total)",
                            "week": "Week 8",
                            "topics": [
                                {
                                    "title": "Common English Idioms (20)",
                                    "description": "Frequently used idiomatic expressions.",
                                    "details": "Piece of cake (easy), break the ice (start conversation), hit the books (study), under the weather (sick), cost an arm and a leg (expensive), once in a blue moon (rarely), best of both worlds, see eye to eye (agree), on cloud nine (very happy), let the cat out of the bag (reveal secret). Use naturally in speaking."
                                },
                                {
                                    "title": "Technology & Modern Life Vocabulary",
                                    "description": "Contemporary vocabulary for IELTS.",
                                    "details": "Internet, website, social media, smartphone, app, download, upload, online, offline, email, password, WiFi, technology, digital, virtual. Verbs: browse, search, post, share, like, comment. IELTS Speaking: role of technology."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Skills: Writing Task 2 Introduction",
                            "week": "Week 8",
                            "topics": [
                                {
                                    "title": "Writing Task 2: Essay Types",
                                    "description": "Opinion, Discussion, Problem-Solution, Two-Part.",
                                    "details": "Opinion: Do you agree or disagree? Discuss: Discuss both views. Problem-Solution: What are problems and solutions? Two-part: Answer 2 questions. Identify essay type from question. 250 words minimum, 40 minutes."
                                },
                                {
                                    "title": "Task 2: Essay Structure",
                                    "description": "Introduction, Body Paragraphs, Conclusion.",
                                    "details": "Introduction: Paraphrase question + thesis statement. Body: 2-3 paragraphs, topic sentence + explanation + example. Conclusion: Summarize main points, restate opinion. 4-5 paragraphs total. Coherence and cohesion important."
                                },
                                {
                                    "title": "IELTS Mini Mock Test",
                                    "description": "First practice test to assess current level.",
                                    "details": "Complete one section of each: Listening (Part 1-2), Reading (1 passage), Writing (Task 1 or 2), Speaking (Part 1). Time yourself. Check answers. Identify weak areas. Review mistakes. Set improvement goals for next months."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Present Perfect Continuous",
                            "week": "Week 9",
                            "topics": [
                                {
                                    "title": "Present Perfect Continuous Structure",
                                    "description": "have/has been + verb-ing",
                                    "details": "Positive: I have been working, She has been studying. Negative: haven't been, hasn't been. Questions: Have you been working? How long has she been studying? Emphasis on duration and continuity of action."
                                },
                                {
                                    "title": "Present Perfect vs Present Perfect Continuous",
                                    "description": "Completed vs ongoing focus.",
                                    "details": "PP: completed action, result (I have read 3 books). PPC: duration, process (I have been reading for 2 hours). Some verbs work better with PPC: work, study, live, wait. State verbs: only PP (I have known him for years, NOT been knowing)."
                                },
                                {
                                    "title": "Time Expressions: for, since, how long",
                                    "description": "Duration and starting point questions.",
                                    "details": "How long have you been...? For 3 hours/days/years. Since 2020/Monday/I was young. All morning/day/week. Practice: I've been waiting for 30 minutes. She's been living here since 2015."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Business, Technology, Academic (500 total)",
                            "week": "Week 9",
                            "topics": [
                                {
                                    "title": "Business Vocabulary",
                                    "description": "Corporate and workplace terms.",
                                    "details": "Company, corporation, employee, employer, staff, management, profit, loss, revenue, budget, invest, market, customer, client, service, product, industry, economy. Collocations: make a profit, cut costs, market research."
                                },
                                {
                                    "title": "Academic Word List Progress (100 total)",
                                    "description": "AWL words 51-100.",
                                    "details": "indicate, individual, inevitably, infer, infrastructure, initiate, input, insert, insight, inspect, institute, instruct, integral, intelligent, intense, interact, intermediate, internal, interval, intervene, invest, investigate, invoke, involve, isolate, job, journal, justify, label, labor, layer, lecture, legal, legislate, levy, liberal, license, likewise, link, locate, logic, maintain, major, manipulate, manual, margin, mature, maximize, mechanism, media."
                                },
                                {
                                    "title": "Collocations (50 total)",
                                    "description": "Natural word combinations for fluency.",
                                    "details": "Make: make progress, make an effort, make a mistake, make money. Take: take place, take part, take action, take advantage. Do: do research, do business, do harm/good. Have: have access, have impact, have influence. Keep: keep in mind, keep track. Common verb+noun, adjective+noun patterns."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Skills: Advanced Listening & Reading",
                            "week": "Week 9",
                            "topics": [
                                {
                                    "title": "IELTS Listening Part 3",
                                    "description": "Conversation in educational/training context.",
                                    "details": "2-4 people: students discussing assignment, tutorial. Multiple choice, matching. Academic vocabulary. Follow conversation flow, identify speakers. Note opinions, agreements, disagreements. Practice: university lectures, academic discussions."
                                },
                                {
                                    "title": "IELTS Listening Part 4",
                                    "description": "Monologue on academic subject.",
                                    "details": "Lecture, talk. Note/sentence/summary completion, multiple choice. Dense information, fast pace. Note-taking skills crucial. Academic topics: science, history, society. Signposting language: firstly, however, in conclusion."
                                },
                                {
                                    "title": "IELTS Reading: True/False/Not Given",
                                    "description": "Most challenging question type.",
                                    "details": "True: statement matches passage information. False: statement contradicts passage. Not Given: information not in passage. Don't use outside knowledge! Look for: exact match (True), opposite (False), missing info (NG). Keywords and paraphrasing."
                                },
                                {
                                    "title": "Writing Task 1: Graphs & Charts",
                                    "description": "Describing trends and comparing data.",
                                    "details": "Vocabulary: increase, rise, grow, go up, decrease, fall, decline, drop, remain stable, fluctuate, peak, reach a peak, hit a low. Adverbs: dramatically, significantly, gradually, slightly, steadily. Time: from...to, between...and, over the period."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Passive Voice",
                            "week": "Week 10",
                            "topics": [
                                {
                                    "title": "Passive Voice: All Tenses",
                                    "description": "be + past participle in different tenses.",
                                    "details": "Present Simple: is/are + PP (It is made). Past Simple: was/were + PP (It was made). Present Perfect: has/have been + PP. Future: will be + PP. Present Continuous: is/are being + PP. Modal: can/must be + PP. Structure: Object → Subject, by + agent (optional)."
                                },
                                {
                                    "title": "Active vs Passive Voice",
                                    "description": "When and why to use passive.",
                                    "details": "Use passive when: action more important than doer, doer unknown/obvious, formal/scientific writing. Active: Someone stole my bike. Passive: My bike was stolen. Academic writing prefers passive for objectivity: The experiment was conducted..."
                                },
                                {
                                    "title": "By-agent: When to include",
                                    "description": "When to mention the doer in passive sentences.",
                                    "details": "Include 'by + agent' when: doer is important/surprising/specific. Omit when: obvious, unknown, unimportant. The book was written by Shakespeare (important). The car was stolen (by someone - obvious, omit). Practice: converting active to passive."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Formal vs Informal, Academic (600 total)",
                            "week": "Week 10",
                            "topics": [
                                {
                                    "title": "Formal vs Informal Language",
                                    "description": "Register appropriate for IELTS Writing.",
                                    "details": "Informal → Formal: kids → children, a lot of → numerous/considerable, get → obtain/receive, ask → request, show → demonstrate, find out → discover/establish, go up → increase, go down → decrease. No contractions (don't → do not), no phrasal verbs (put up with → tolerate)."
                                },
                                {
                                    "title": "Academic Vocabulary (150 total)",
                                    "description": "AWL words 101-150.",
                                    "details": "method, migrate, military, minimal, minimize, minimum, minor, mode, modify, monitor, motive, mutual, negate, network, neutral, nevertheless, nonetheless, normal, notion, notwithstanding, nuclear, objective, obtain, obvious, occupy, occur, odd, offset, ongoing, option, orient, outcome, output, overall, overlap, overseas, panel, paradigm, paragraph, parallel, parameter, participate, partner, passive, perceive, percent, period, persist, perspective, phase."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Practice: Writing Task 2 & Speaking",
                            "week": "Week 10",
                            "topics": [
                                {
                                    "title": "Writing Task 2: Opinion Essays",
                                    "description": "Agree/Disagree essays - state clear position.",
                                    "details": "Structure: Introduction (paraphrase + clear opinion), Body 1 (reason 1 + explanation + example), Body 2 (reason 2 + explanation + example), Conclusion (restate opinion). Phrases: In my opinion, I strongly believe, I completely agree/disagree, It is evident that. Coherence: Firstly, Secondly, Furthermore, Moreover, In conclusion."
                                },
                                {
                                    "title": "IELTS Speaking: All Parts Practice",
                                    "description": "Comprehensive speaking practice.",
                                    "details": "Part 1 (4-5 min): personal questions, short answers, extend. Part 2 (3-4 min): topic card, 1 min prep, 2 min speech. Part 3 (4-5 min): abstract discussion, opinions, analyze. Fluency, coherence, vocabulary, grammar, pronunciation assessed. Practice: record yourself, identify fillers (um, uh), improve pace."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Conditionals (Zero & First)",
                            "week": "Week 11",
                            "topics": [
                                {
                                    "title": "Zero Conditional",
                                    "description": "General truths and scientific facts.",
                                    "details": "If + present simple, present simple. If you heat water to 100°C, it boils. If I'm tired, I go to bed early. When can replace if. Result is always true. Used for: instructions, general facts, habits. Practice with science, routines."
                                },
                                {
                                    "title": "First Conditional",
                                    "description": "Real future possibilities.",
                                    "details": "If + present simple, will + base verb. If it rains tomorrow, I will stay home. If she studies hard, she will pass the exam. Real possibility in future. Can use: unless (if not), in case, as long as, provided that. Modal verbs possible: might, may, can."
                                },
                                {
                                    "title": "Future Time Clauses Review",
                                    "description": "When, as soon as, before, after, until, by the time.",
                                    "details": "After I finish work, I'll call you. I'll wait until you arrive. When he gets home, he'll cook dinner. Present simple in time clause (NOT will)! Main clause: future. Practice: planning, scheduling, sequences."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Education, Environment, Phrasal Verbs (700 total)",
                            "week": "Week 11",
                            "topics": [
                                {
                                    "title": "Education Vocabulary",
                                    "description": "Academic and learning-related terms.",
                                    "details": "Primary/secondary/higher education, enroll, curriculum, syllabus, assignment, essay, thesis, dissertation, semester, academic year, graduate, undergraduate, postgraduate, tuition fees, scholarship, literacy, numeracy, compulsory, optional. IELTS topic frequency high."
                                },
                                {
                                    "title": "Environment Vocabulary",
                                    "description": "Ecology and environmental issues.",
                                    "details": "Pollution, climate change, global warming, greenhouse gases, emissions, renewable energy, solar/wind power, fossil fuels, deforestation, extinction, endangered species, conservation, recycle, reuse, reduce, sustainable, ecosystem, biodiversity. Common IELTS Writing topic."
                                },
                                {
                                    "title": "Phrasal Verbs (50 total)",
                                    "description": "Common multi-word verbs for speaking.",
                                    "details": "Look: look for (search), look after (care for), look up to (admire), look forward to. Turn: turn on/off, turn up/down (volume), turn into (become). Give: give up (quit), give in (surrender), give away (donate). Put: put off (postpone), put up with (tolerate). Bring: bring up (raise topic/child)."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Skills: Reading Matching & Writing Processes",
                            "week": "Week 11",
                            "topics": [
                                {
                                    "title": "IELTS Reading: Matching Headings",
                                    "description": "Match paragraph headings to main ideas.",
                                    "details": "Read heading first, understand meaning. Skim each paragraph for main idea (usually first/last sentence). Look for: synonyms, paraphrases of heading words. Eliminate used headings. Don't match just because same word appears. Practice: identify topic sentence, supporting details."
                                },
                                {
                                    "title": "Writing Task 1: Processes & Diagrams",
                                    "description": "Describing how something works or is made.",
                                    "details": "Structure: Introduction (paraphrase), Overview (start/end points, number of stages), Details (describe each stage in sequence). Language: Passive voice (is heated, are collected), Sequencing (First, Next, Then, After that, Finally), Purpose (in order to, so that). No data/numbers."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Past Continuous & Past Perfect",
                            "week": "Week 12",
                            "topics": [
                                {
                                    "title": "Past Continuous",
                                    "description": "was/were + verb-ing for ongoing past actions.",
                                    "details": "Use: action in progress at specific past time (I was studying at 8pm yesterday), background action in story, interrupted action (I was sleeping when the phone rang). Time markers: at that time, at 5 o'clock, while, when. Parallel actions: While I was cooking, he was watching TV."
                                },
                                {
                                    "title": "Past Perfect",
                                    "description": "had + past participle for earlier past action.",
                                    "details": "Use: action before another past action. When I arrived (past simple), she had left (past perfect - earlier). Time markers: already, just, before, after, by the time. Sequence: I had finished homework before dinner started. Reported speech: He said he had been there."
                                },
                                {
                                    "title": "Past Perfect vs Past Simple",
                                    "description": "Distinguishing earlier vs later past actions.",
                                    "details": "Past Perfect: earlier action. Past Simple: later action. When I got home, my wife had cooked dinner (cooking finished before arriving). The movie had started when we arrived. After he had eaten, he went out. Not needed if sequence clear with 'before/after'."
                                },
                                {
                                    "title": "When, While, As Connectors",
                                    "description": "Connecting simultaneous and sequential actions.",
                                    "details": "When: point in time, short actions (When I saw him, I waved). While: duration, background (While I was walking, I met John). As: simultaneous (As I opened the door, the phone rang). Practice: storytelling, past narratives."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Academic Words & Linking (800 total)",
                            "week": "Week 12",
                            "topics": [
                                {
                                    "title": "Academic Vocabulary (200 total)",
                                    "description": "AWL words 151-200.",
                                    "details": "philosophy, physical, plus, policy, portion, pose, positive, potential, practitioner, precede, precise, predict, predominant, preliminary, presumably, previous, primary, prime, principal, principle, prior, priority, proceed, process, professional, prohibit, project, promote, proportion, prospect, protocol, psychology, publication, publish, purchase, pursue, qualitative, quote, radical, random, range, ratio, rational, react, recover, refine, regime, region, register."
                                },
                                {
                                    "title": "Linking Words & Cohesion",
                                    "description": "Connecting ideas in writing and speaking.",
                                    "details": "Addition: moreover, furthermore, in addition, besides, additionally. Contrast: however, nevertheless, on the other hand, whereas, while. Result: therefore, consequently, as a result, thus, hence. Example: for instance, such as, namely. Summary: in conclusion, to sum up, overall, in brief. Sequence: firstly, secondly, finally, next, subsequently."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Full Mock Test & Review",
                            "week": "Week 12",
                            "topics": [
                                {
                                    "title": "First Full IELTS Mock Test",
                                    "description": "Complete all 4 sections under exam conditions.",
                                    "details": "Listening: 30+10 min (all parts 1-4). Reading: 60 min (3 passages, 40 questions). Writing: 60 min (Task 1: 20 min, Task 2: 40 min). Speaking: 11-14 min (all 3 parts). Use Cambridge IELTS book. Time strictly. No dictionaries."
                                },
                                {
                                    "title": "Error Analysis & Improvement Plan",
                                    "description": "Identify weaknesses and create action plan.",
                                    "details": "Check answers, calculate band score (approximate). Analyze: Why mistakes? (vocabulary, grammar, time, misunderstanding). Identify patterns: specific question types, grammar points, vocabulary gaps. Create plan: focus on weak areas in Month 4. Set realistic band score goal."
                                }
                            ]
                        }
                    ]
                },
            },
            {
                "advanced": {
                    "level": "ADVANCED (C1-C2)",
                    "duration": "Months 4-5 (Weeks 13-20)",
                    "modules": [
                        {
                            "module": "Grammar: Second & Third Conditionals",
                            "week": "Week 13",
                            "topics": [
                                {
                                    "title": "Second Conditional",
                                    "description": "Unreal/unlikely present situations.",
                                    "details": "If + past simple, would + base verb. If I won the lottery, I would travel the world (unlikely). If I were rich, I would buy a house (were, not was, for all persons in formal English). Imaginary situations. Uses: hypothetical present, advice (If I were you, I would...)."
                                },
                                {
                                    "title": "Third Conditional",
                                    "description": "Unreal past - regrets and criticism.",
                                    "details": "If + past perfect, would have + past participle. If I had studied harder, I would have passed (didn't study, didn't pass). Imagining different past. Regrets: If I had known, I wouldn't have come. Mixed with could have, might have."
                                },
                                {
                                    "title": "Mixed Conditionals",
                                    "description": "Combining different time references.",
                                    "details": "Past condition → Present result: If I had studied medicine (past), I would be a doctor now (present). Present condition → Past result: If I were braver (present), I would have told him (past). Practice: life decisions, regrets."
                                },
                                {
                                    "title": "Wish & If only",
                                    "description": "Expressing regrets and desires.",
                                    "details": "Wish + past simple: present regret (I wish I had more money). Wish + past perfect: past regret (I wish I had studied harder). Wish + would: annoying habits (I wish you would stop smoking). If only: stronger emotion (If only I were taller!)."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Advanced Collocations & Academic (1000 total)",
                            "week": "Week 13",
                            "topics": [
                                {
                                    "title": "Advanced Collocations",
                                    "description": "Sophisticated word combinations for Band 8-9.",
                                    "details": "Utterly convinced, bitterly disappointed, deeply concerned, fully aware, highly unlikely, widely accepted, readily available, severely damaged, painfully obvious, strictly forbidden, marginally better, tentatively agreed, profoundly affected, substantially increased, considerably enhanced."
                                },
                                {
                                    "title": "Academic Word List (300 total)",
                                    "description": "AWL words 201-300.",
                                    "details": "regulate, reinforce, reject, relax, release, relevant, reluctance, rely, remove, require, research, reside, resolve, resource, respond, restore, restrain, restrict, retain, reveal, revenue, reverse, revise, revolution, rigid, role, route, scenario, schedule, scheme, scope, section, sector, secure, seek, select, sequence, series, sex, shift, significant, similar, simulate, site, so-called, sole, somewhat, source, specific, specify, sphere, stable, statistic, status, straightforward, strategy, stress, structure, style, submit, subordinate, subsequent, subsidy, substitute, succeed, successive, sufficient, sum, summary, supplement, survey, survive, suspend, sustain, symbol, tape, target, task, team, technical, technique, technology, temporary, tense, terminate, text, theme, theory, thereby, thesis."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Writing: Discussion Essays & Advanced Skills",
                            "week": "Week 13",
                            "topics": [
                                {
                                    "title": "Writing Task 2: Discussion Essays",
                                    "description": "Discuss both views and give opinion.",
                                    "details": "Structure: Intro (paraphrase + both views exist + your position), Body 1 (View A + explanation + example), Body 2 (View B + explanation + example), Conclusion (both views summary + clear opinion). Balanced discussion. Phrases: Some people believe... while others argue..., On one hand... on the other hand..., Despite... Benefits... Outweigh..."
                                },
                                {
                                    "title": "IELTS Reading: Sentence Completion",
                                    "description": "Complete sentences with words from passage.",
                                    "details": "Follow word limit! (NO MORE THAN THREE WORDS). Use exact words from passage. Grammar must be correct. Locate keywords in question. Scan passage for synonyms/paraphrases. Check: spelling, word form, article, singular/plural."
                                },
                                {
                                    "title": "IELTS Speaking: Fluency & Coherence",
                                    "description": "Improving speaking delivery for Band 8-9.",
                                    "details": "Reduce pauses and fillers (um, uh, like, you know). Maintain a natural pace, use linking words for coherence. Practice extended responses on abstract topics. Focus on intonation, stress, and rhythm to sound more native-like. Record sessions and self-evaluate for improvements."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Reported Speech",
                            "week": "Week 14",
                            "topics": [
                                {
                                    "title": "Direct vs Indirect Speech",
                                    "description": "Converting direct quotes to indirect statements.",
                                    "details": "Direct: He said, 'I am tired.' Indirect: He said that he was tired. Pronoun changes: I → he/she, my → his/her. Time shifts: now → then, today → that day. Practice with statements, questions, commands."
                                },
                                {
                                    "title": "Tense Changes",
                                    "description": "Backshift in reported speech tenses.",
                                    "details": "Present simple → past simple, present continuous → past continuous, will → would, can → could. No change if reporting verb in present (says). Exceptions: universal truths (He said the Earth is round). Practice mixed tense conversions."
                                },
                                {
                                    "title": "Reporting Verbs",
                                    "description": "Verbs used in indirect speech.",
                                    "details": "Say, tell, ask, suggest, promise, admit, complain, explain, warn, advise. Patterns: tell + object, suggest + ing, promise + to infinitive. Practice: He suggested going to the cinema. She complained about the noise."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Paraphrasing & Topic Words (1200 total)",
                            "week": "Week 14",
                            "topics": [
                                {
                                    "title": "Paraphrasing Skills",
                                    "description": "Rewriting ideas using different words.",
                                    "details": "Use synonyms, change sentence structure, active to passive. Essential for IELTS Writing and Reading. Practice: Original: The population increased. Paraphrase: There was a rise in the number of people."
                                },
                                {
                                    "title": "Topic Vocabulary: Health, Crime, Media",
                                    "description": "Specialized terms for common IELTS topics.",
                                    "details": "Health: obesity, vaccination, mental health, healthcare system, epidemic. Crime: burglary, vandalism, deterrence, rehabilitation, juvenile delinquency. Media: censorship, fake news, social media, journalism, influence. Use in essays and speaking."
                                },
                                {
                                    "title": "Academic Word List (350 total)",
                                    "description": "AWL words 301-350.",
                                    "details": "though, trace, tradition, transfer, transform, transit, transmit, transport, trend, trigger, ultimate, undergo, underline, undertake, uniform, unify, unique, utility, utilize, valid, vary, vehicle, version, via, violate, virtual, visible, vision, visual, volume, voluntary, welfare, whereas, whereby, widespread."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Practice: Listening & Writing",
                            "week": "Week 14",
                            "topics": [
                                {
                                    "title": "Listening: All Parts - Speed Practice",
                                    "description": "Practice listening at faster speeds.",
                                    "details": "Use audio at 1.25x-1.5x speed. Focus on Parts 1-4: conversations, monologues, academic discussions. Improve note-taking under pressure. Review transcripts for missed words."
                                },
                                {
                                    "title": "Writing: Both Tasks Under Time",
                                    "description": "Timed practice for Task 1 and 2.",
                                    "details": "Task 1 (20 min): Describe graphs/maps/processes. Task 2 (40 min): Write essays on opinion/discussion topics. Check word count, coherence, vocabulary range. Self-assess using band descriptors."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Relative Clauses",
                            "week": "Week 15",
                            "topics": [
                                {
                                    "title": "Defining Relative Clauses",
                                    "description": "Essential information about nouns.",
                                    "details": "No commas: The man who called is my boss. Pronouns: who (people), which (things), that (both), where (place), when (time), whose (possession). Practice combining sentences."
                                },
                                {
                                    "title": "Non-defining Relative Clauses",
                                    "description": "Additional, non-essential information.",
                                    "details": "With commas: My brother, who lives in London, is visiting. Cannot use 'that'. Use for extra details. Practice: The Eiffel Tower, which is in Paris, is famous."
                                },
                                {
                                    "title": "Relative Pronouns",
                                    "description": "Who, which, that, where, whose.",
                                    "details": "Omit pronoun if object: The book (that) I read was good. Prepositions: The house in which I live. Formal/informal usage. Practice complex sentences for IELTS Writing."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Advanced & Academic (1400 total)",
                            "week": "Week 15",
                            "topics": [
                                {
                                    "title": "Advanced Vocabulary",
                                    "description": "Sophisticated words for high-band scores.",
                                    "details": "Ubiquitous, plethora, mitigate, exacerbate, paradigm, resilient, sustainable, innovative, disparity, corroborate. Use in context for Speaking Part 3 and Writing Task 2."
                                },
                                {
                                    "title": "Academic Word List (400 total)",
                                    "description": "AWL words 351-400.",
                                    "details": "academy, access, accommodate, accompany, accumulate, accurate, achieve, acknowledge, acquire, adapt, adequate, adjacent, adjust, administrate, adult, advocate, affect, aggregate, aid, albeit, allocate, alter, alternative, ambiguous, amend, analogy, analyze, annual, anticipate, apparent, append, appreciate, approach, appropriate, approximate, arbitrary, area, aspect, assemble, assess, assign, assist, assume, assure, attach, attain, attitude, attribute, author, authority, automate, available, aware, behalf."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Skills: Reading & Speaking & Writing",
                            "week": "Week 15",
                            "topics": [
                                {
                                    "title": "IELTS Reading: Yes/No/Not Given",
                                    "description": "Similar to True/False/Not Given but for opinions.",
                                    "details": "Yes: agrees with writer, No: contradicts, Not Given: not mentioned. Focus on writer's views. Practice with academic passages on controversial topics."
                                },
                                {
                                    "title": "Speaking: Complex Ideas Expression",
                                    "description": "Articulating abstract concepts.",
                                    "details": "Part 3 practice: Discuss global issues, give opinions with reasons/examples. Use advanced vocab, conditionals, passives. Avoid simple sentences; aim for complexity."
                                },
                                {
                                    "title": "Writing: Task 1 - Maps, Diagrams",
                                    "description": "Describing changes or layouts.",
                                    "details": "Maps: changes over time (past/present/future). Diagrams: processes. Use location language (north of, adjacent to), change vocab (demolished, constructed). Structure: intro, overview, details."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Advanced Tenses",
                            "week": "Week 16",
                            "topics": [
                                {
                                    "title": "Past Perfect Continuous",
                                    "description": "Had been + verb-ing for ongoing past before past.",
                                    "details": "She had been working for hours when I arrived. Emphasis on duration causing result. Practice: causes of events, storytelling."
                                },
                                {
                                    "title": "Future Perfect",
                                    "description": "Will have + past participle for completed future action.",
                                    "details": "By 2030, we will have colonized Mars. With by + time. Practice: predictions, timelines."
                                },
                                {
                                    "title": "Future Continuous",
                                    "description": "Will be + verb-ing for ongoing future action.",
                                    "details": "This time next year, I'll be living abroad. Interruptions in future. Practice: plans, arrangements."
                                },
                                {
                                    "title": "Mixed Tenses Review",
                                    "description": "Combining all tenses in complex sentences.",
                                    "details": "Narrative practice: stories mixing past, present, future. Error correction exercises."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Idioms & Academic (1600 total)",
                            "week": "Week 16",
                            "topics": [
                                {
                                    "title": "Idioms (50 total)",
                                    "description": "Advanced idiomatic expressions.",
                                    "details": "Burn the midnight oil (study late), bite the bullet (face difficulty), spill the beans (reveal secret), hit the nail on the head (be exactly right). Use in Speaking for naturalness."
                                },
                                {
                                    "title": "Academic Vocabulary (500 total)",
                                    "description": "AWL words 401-500.",
                                    "details": "benefit, brief, bulk, capable, capacity, category, cease, challenge, channel, chapter, chart, chemical, circumstance, cite, civil, clarify, classic, clause, code, coherent, coincide, collapse, colleague, commence, comment, commission, commit, commodity, communicate, community, compatible, compensate, compile, complement, complex, component, compound, comprehensive, comprise, compute, conceive, concentrate, concept, conclude, concurrent, conduct, confer, confine, confirm, conflict, conform, consent, considerable, consist, constant, constitute, constrain, construct, consult, consume, contact, contemporary, context, contract, contradict, contrary, contrast, contribute, controversy, convene, converse, convert, convince, cooperate, coordinate, core, corporate, correspond, couple, create, credit, criteria, crucial, culture, currency, cycle, data, debate, decade, decline, deduce, define, definite, demonstrate, denote, deny, depress, derive, design, despite, detect, deviate, device, devote, differentiate, dimension, diminish, discrete, discriminate, displace, display, dispose, distinct, distort, distribute, diverse, document, domain, domestic, dominate, draft, drama, drastic, duration, dynamic, economy, edit, element, eliminate, empirical, enable, encounter, energy, enforce, enhance, enormous, ensure, entity, environment, equate, equip, equivalent, erode, error, establish, estate, estimate, ethic, ethnic, evaluate, eventual, evident, evolve, exceed, exclude, exhibit, expand, expert, explicit, exploit, export, expose, external, extract, facilitate, factor, feature, federal, fee, file, final, finance, finite, flexible, fluctuate, focus, format, formula, forth, found, foundation, framework, function, fund, fundamental, furthermore, gender, generate, generation, globe, goal, grade, grant, guarantee, guideline, hence, hierarchy, highlight, hypothesis, identical, identify, ideology, ignorance, illustrate, image, immigrate, impact, implement, implicate, implicit, imply, impose, incentive, incidence, incline, income, incorporate, index, indicate, individual, induce, inevitable, infer, infrastructure, inherent, inhibit, initial, initiate, injure, innovate, insert, insight, inspect, instance, institute, instruct, integral, intelligence, intense, interact, intermediate, internal, interpret, interval, intervene, intrinsic, invest, investigate, invoke, involve, isolate, issue, item, job, journal, justify, label, labour, layer, lecture, legal, legislate, levy, liberal, licence, likewise, link, locate, logic, maintain, major, manipulate, manual, margin, mature, maximise, mechanism, media, mediate, medical, medium, mental, mention, menu, merge, migrate, military, minimal, minimise, minimum, minister, minor, mode, modify, monitor, motive, motor, mutual, negate, network, neutral, nevertheless, nonetheless, norm, normal, notion, notwithstanding, nuclear, objective, obtain, obvious, occupy, occur, odd, offset, ongoing, option, orient, outcome, output, overall, overlap, overseas, panel, paradigm, paragraph, parallel, parameter, participate, partner, passive, perceive, percent, period, persist, perspective, phase, phenomenon, philosophy, physical, plus, policy, portion, pose, positive, potential, practitioner, precede, precise, predict, predominant, preliminary, presume, previous, primary, prime, principal, principle, prior, priority, proceed, process, professional, prohibit, project, promote, proportion, prospect, protocol, psychology, publication, publish, purchase, pursue, qualitative, quote, radical, random, range, ratio, rational, react, recover, refine, regime, region, register, regulate, reinforce, reject, relax, release, relevant, reluctance, rely, remove, require, research, reside, resolve, resource, respond, restore, restrain, restrict, retain, reveal, revenue, reverse, revise, revolution, rigid, role, route, scenario, schedule, scheme, scope, section, sector, secure, seek, select, sequence, series, sex, shift, significant, similar, simulate, site, so-called, sole, somewhat, source, specific, specify, sphere, stable, statistic, status, straightforward, strategy, stress, structure, style, submit, subordinate, subsequent, subsidy, substitute, succeed, successive, sufficient, sum, summary, supplement, survey, survive, suspend, sustain, symbol, tape, target, task, team, technical, technique, technology, temporary, tense, terminate, text, theme, theory, thereby, thesis, though, trace, tradition, transfer, transform, transit, transmit, transport, trend, trigger, ultimate, undergo, underline, undertake, uniform, unify, unique, utility, utilize, valid, vary, vehicle, version, via, violate, virtual, visible, vision, visual, volume, voluntary, welfare, whereas, whereby, widespread."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Practice: Mock Test & Review",
                            "week": "Week 16",
                            "topics": [
                                {
                                    "title": "Second Full IELTS Mock Test",
                                    "description": "Complete all sections with time limits.",
                                    "details": "Simulate exam conditions. Score and analyze performance. Compare with first mock to track progress."
                                },
                                {
                                    "title": "Weak Areas Focus",
                                    "description": "Targeted practice on identified weaknesses.",
                                    "details": "Review errors from mock. Extra exercises on problematic grammar/vocab/skills. Set goals for final month."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Inversion & Emphasis",
                            "week": "Week 17",
                            "topics": [
                                {
                                    "title": "Inversion",
                                    "description": "Subject-verb inversion for emphasis.",
                                    "details": "Never have I seen such beauty. Not only... but also. After negatives/adverbs: Only then did he realize. Practice formal writing/speaking."
                                },
                                {
                                    "title": "Cleft Sentences",
                                    "description": "It was... that/who for focus.",
                                    "details": "It was John who called (emphasis on John). What I need is time. Practice rephrasing for variety in essays."
                                },
                                {
                                    "title": "Emphasis Structures",
                                    "description": "Advanced ways to highlight information.",
                                    "details": "Fronting, auxiliaries: Do be careful! So/such: So tired was he that... For Band 8+ grammatical range."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Less Common & Academic (2000 total)",
                            "week": "Week 17",
                            "topics": [
                                {
                                    "title": "Less Common Vocabulary",
                                    "description": "Rare words for high-level expression.",
                                    "details": "Euphemism, dichotomy, ubiquitous, quintessential, paradigm shift, hegemony, altruism, catharsis. Contextual use in abstracts."
                                },
                                {
                                    "title": "Academic Word List (600 total)",
                                    "description": "AWL words 501-600.",
                                    "details": "academy, access, accommodate, accompany, accumulate, accurate, achieve, acknowledge, acquire, adapt, adequate, adjacent, adjust, administrate, adult, advocate, affect, aggregate, aid, albeit, allocate, alter, alternative, ambiguous, amend, analogy, analyze, annual, anticipate, apparent, append, appreciate, approach, appropriate, approximate, arbitrary, area, aspect, assemble, assess, assign, assist, assume, assure, attach, attain, attitude, attribute, author, authority, automate, available, aware, behalf, benefit, brief, bulk, capable, capacity, category, cease, challenge, channel, chapter, chart, chemical, circumstance, cite, civil, clarify, classic, clause, code, coherent, coincide, collapse, colleague, commence, comment, commission, commit, commodity, communicate, community, compatible, compensate, compile, complement, complex, component, compound, comprehensive, comprise, compute, conceive, concentrate, concept, conclude, concurrent, conduct, confer, confine, confirm, conflict, conform, consent, considerable, consist, constant, constitute, constrain, construct, consult, consume, contact, contemporary, context, contract, contradict, contrary, contrast, contribute, controversy, convene, converse, convert, convince, cooperate, coordinate, core, corporate, correspond, couple, create, credit, criteria, crucial, culture, currency, cycle, data, debate, decade, decline, deduce, define, definite, demonstrate, denote, deny, depress, derive, design, despite, detect, deviate, device, devote, differentiate, dimension, diminish, discrete, discriminate, displace, display, dispose, distinct, distort, distribute, diverse, document, domain, domestic, dominate, draft, drama, drastic, duration, dynamic, economy, edit, element, eliminate, empirical, enable, encounter, energy, enforce, enhance, enormous, ensure, entity, environment, equate, equip, equivalent, erode, error, establish, estate, estimate, ethic, ethnic, evaluate, eventual, evident, evolve, exceed, exclude, exhibit, expand, expert, explicit, exploit, export, expose, external, extract, facilitate, factor, feature, federal, fee, file, final, finance, finite, flexible, fluctuate, focus, format, formula, forth, found, foundation, framework, function, fund, fundamental, furthermore, gender, generate, generation, globe, goal, grade, grant, guarantee, guideline, hence, hierarchy, highlight, hypothesis, identical, identify, ideology, ignorance, illustrate, image, immigrate, impact, implement, implicate, implicit, imply, impose, incentive, incidence, incline, income, incorporate, index, indicate, individual, induce, inevitable, infer, infrastructure, inherent, inhibit, initial, initiate, injure, innovate, insert, insight, inspect, instance, institute, instruct, integral, intelligence, intense, interact, intermediate, internal, interpret, interval, intervene, intrinsic, invest, investigate, invoke, involve, isolate, issue, item, job, journal, justify, label, labour, layer, lecture, legal, legislate, levy, liberal, licence, likewise, link, locate, logic, maintain, major, manipulate, manual, margin, mature, maximise, mechanism, media, mediate, medical, medium, mental, mention, menu, merge, migrate, military, minimal, minimise, minimum, minister, minor, mode, modify, monitor, motive, motor, mutual, negate, network, neutral, nevertheless, nonetheless, norm, normal, notion, notwithstanding, nuclear, objective, obtain, obvious, occupy, occur, odd, offset, ongoing, option, orient, outcome, output, overall, overlap, overseas, panel, paradigm, paragraph, parallel, parameter, participate, partner, passive, perceive, percent, period, persist, perspective, phase, phenomenon, philosophy, physical, plus, policy, portion, pose, positive, potential, practitioner, precede, precise, predict, predominant, preliminary, presume, previous, primary, prime, principal, principle, prior, priority, proceed, process, professional, prohibit, project, promote, proportion, prospect, protocol, psychology, publication, publish, purchase, pursue, qualitative, quote, radical, random, range, ratio, rational, react, recover, refine, regime, region, register, regulate, reinforce, reject, relax, release, relevant, reluctance, rely, remove, require, research, reside, resolve, resource, respond, restore, restrain, restrict, retain, reveal, revenue, reverse, revise, revolution, rigid, role, route, scenario, schedule, scheme, scope, section, sector, secure, seek, select, sequence, series, sex, shift, significant, similar, simulate, site, so-called, sole, somewhat, source, specific, specify, sphere, stable, statistic, status, straightforward, strategy, stress, structure, style, submit, subordinate, subsequent, subsidy, substitute, succeed, successive, sufficient, sum, summary, supplement, survey, survive, suspend, sustain, symbol, tape, target, task, team, technical, technique, technology, temporary, tense, terminate, text, theme, theory, thereby, thesis, though, trace, tradition, transfer, transform, transit, transmit, transport, trend, trigger, ultimate, undergo, underline, undertake, uniform, unify, unique, utility, utilize, valid, vary, vehicle, version, via, violate, virtual, visible, vision, visual, volume, voluntary, welfare, whereas, whereby, widespread."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Focus: Band 8-9 Structures",
                            "week": "Week 17",
                            "topics": [
                                {
                                    "title": "Writing: Band 8-9 Structures",
                                    "description": "Advanced grammar for high scores.",
                                    "details": "Use inversions, clefts, complex conditionals in essays. Vary sentence length/structure. Practice Task 2 with advanced topics."
                                },
                                {
                                    "title": "Speaking: Advanced Expressions",
                                    "description": "Idiomatic and formal language.",
                                    "details": "Incorporate idioms, collocations, academic phrases. Practice Part 3 discussions on global issues."
                                },
                                {
                                    "title": "Complex Sentence Structures",
                                    "description": "Building sophisticated sentences.",
                                    "details": "Combine clauses with subordinators. Avoid errors in complex grammar. For all skills, especially Writing/Speaking."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Subjunctive & Advanced Modals",
                            "week": "Week 18",
                            "topics": [
                                {
                                    "title": "Subjunctive Mood",
                                    "description": "For hypothetical, wishes, suggestions.",
                                    "details": "It's important that he be here (be, not is). After verbs: suggest, recommend, insist. Practice formal contexts."
                                },
                                {
                                    "title": "Modal Perfects",
                                    "description": "Must have, should have for past deduction/advice.",
                                    "details": "He must have forgotten (deduction). You should have called (regret). Practice speculations about past."
                                },
                                {
                                    "title": "Advanced Modal Usage",
                                    "description": "Nuances in modals.",
                                    "details": "Dare, need as modals. Semi-modals: be able to, have to. Degrees of probability: might have, could be."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Sophisticated & Paraphrasing (2500 total)",
                            "week": "Week 18",
                            "topics": [
                                {
                                    "title": "Sophisticated Vocabulary",
                                    "description": "High-level words for precision.",
                                    "details": "Ephemeral, ubiquitous, paradigm, quintessential, hegemony, catharsis, altruism, dichotomy. Contextual integration."
                                },
                                {
                                    "title": "Paraphrasing Mastery",
                                    "description": "Advanced rewording techniques.",
                                    "details": "Change word order, use synonyms/antonyms, nominalization. Crucial for Reading/Writing. Practice full paragraphs."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Practice: Speed & Accuracy",
                            "week": "Week 18",
                            "topics": [
                                {
                                    "title": "Reading: Speed + Accuracy",
                                    "description": "Timed practice with complex passages.",
                                    "details": "20 min per passage. Focus on skimming/scanning, all question types. Build stamina."
                                },
                                {
                                    "title": "Listening: Note-taking Skills",
                                    "description": "Advanced note-taking.",
                                    "details": "Abbreviations, symbols. Practice with lectures at normal speed. Predict answers."
                                },
                                {
                                    "title": "Daily Mock Sections",
                                    "description": "Sectional practice daily.",
                                    "details": "One section per skill daily. Review immediately. Track band progress."
                                }
                            ]
                        },
                        {
                            "module": "Grammar: Participle Clauses & Ellipsis",
                            "week": "Week 19",
                            "topics": [
                                {
                                    "title": "Participle Clauses",
                                    "description": "Using -ing/-ed for concise sentences.",
                                    "details": "Having finished, he left. Tired from work, she slept. Replace relative/adverbial clauses. Practice condensation."
                                },
                                {
                                    "title": "Ellipsis and Substitution",
                                    "description": "Omitting repeated words.",
                                    "details": "I can swim and so can she. Use do/does/did for substitution. For coherence in Writing."
                                },
                                {
                                    "title": "Advanced Sentence Structures",
                                    "description": "Combining for complexity.",
                                    "details": "Embedded clauses, fronting. Achieve grammatical range for Band 9."
                                }
                            ]
                        },
                        {
                            "module": "Vocabulary: Topic-specific & Collocations (3000+ total)",
                            "week": "Week 19",
                            "topics": [
                                {
                                    "title": "Topic-specific Advanced Vocabulary",
                                    "description": "Deep dive into IELTS themes.",
                                    "details": "Globalization: outsourcing, cultural homogenization. Technology: AI, cybersecurity. Environment: carbon footprint, sustainability."
                                },
                                {
                                    "title": "Collocations Mastery",
                                    "description": "Advanced natural combinations.",
                                    "details": "Commit a crime, reach a consensus, pose a threat, exert influence. Practice in essays."
                                }
                            ]
                        },
                        {
                            "module": "IELTS Intensive: Daily Practice",
                            "week": "Week 19",
                            "topics": [
                                {
                                    "title": "Har Kuni Full Mock Test Section",
                                    "description": "Daily sectional mocks.",
                                    "details": "Rotate skills. Time strictly. Immediate review."
                                },
                                {
                                    "title": "Time Management",
                                    "description": "Strategies for exam pacing.",
                                    "details": "Allocate time per question. Skip and return. Practice under pressure."
                                },
                                {
                                    "title": "Strategy Refinement",
                                    "description": "Fine-tune approaches.",
                                    "details": "Personalize techniques based on mocks. Focus on accuracy over speed."
                                }
                            ]
                        },
                        {
                            "module": "Final Sprint: Review & Tests",
                            "week": "Week 20",
                            "topics": [
                                {
                                    "title": "Full Grammar Review",
                                    "description": "All tenses and structures.",
                                    "details": "Days 1-2: Revise all grammar points. Error correction exercises."
                                },
                                {
                                    "title": "Vocabulary Revision (3000+ words)",
                                    "description": "Comprehensive vocab review.",
                                    "details": "Days 3-4: AWL full list, idioms, collocations. Flashcards, quizzes."
                                },
                                {
                                    "title": "Daily Full Mock Tests",
                                    "description": "Simulate real exams.",
                                    "details": "Days 5-7: Full tests daily. Score, feedback, final adjustments."
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }

    const getFrameworkColor = (id) => {
        const fw = frameworks.find(f => f.id === id);
        return fw ? fw.color : 'bg-gray-500';
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-8" >
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4"> Complete Frontend Roadmap </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-2"> JavaScript va React.js </p>
                    <p className="text-slate-500 text-sm md:text-base"> 0 dan Expert darajagacha to'liq yo'l xaritasi </p>
                </div>
                {/* Framework Tabs */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {frameworks.map((fw) => (
                        <button
                            key={fw.id}
                            onClick={() => setActiveFramework(fw.id)}
                            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base ${activeFramework === fw.id ? `${fw.color} text-white shadow-lg scale-105` : 'bg-white text-slate-700 hover:bg-slate-100 shadow'
                                }`}
                        >
                            {fw.name}
                        </button>
                    ))}
                </div>
                <div className="space-y-6 md:space-y-8">
                    {roadmapData[activeFramework].map((level) => (
                        <div key={level.id} className={`rounded-xl border-2 ${level.color} overflow-hidden shadow-lg`}>
                            <div className={`${level.headerColor} p-4 md:p-6 border-b-2 border-opacity-20`}>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
                                    <Zap className="w-6 h-6 md:w-8 md:h-8" /> {level.level}
                                </h2>
                            </div>
                            <div className="p-4 md:p-6">
                                {level.sections.map((section) => (
                                    <div key={section.id} className="mb-4 last:mb-0">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full bg-white hover:bg-slate-50 p-3 md:p-4 rounded-lg shadow-sm border border-slate-200 transition-all duration-200 flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                                <Code className="w-4 h-4 md:w-5 md:h-5 text-slate-600 group-hover:text-slate-800 flex-shrink-0" />
                                                <span className="font-semibold text-base md:text-lg text-slate-800 truncate"> {section.category} </span>
                                                <span className="text-xs md:text-sm text-slate-500 flex-shrink-0"> ({section.topics.length}) </span>
                                            </div>
                                            {expandedSections[section.id] ? (
                                                <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-slate-600 flex-shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-slate-600 flex-shrink-0" />
                                            )}
                                        </button>
                                        {expandedSections[section.id] && (
                                            <div className="mt-3 bg-white rounded-lg p-3 md:p-4 border border-slate-200 shadow-sm">
                                                <ul className="space-y-4">
                                                    {section.topics.map((topic, idx) => (
                                                        <li key={idx} className="flex flex-col gap-2 text-sm md:text-base text-slate-700 border-b pb-2 last:border-b-0">
                                                            <div className="flex items-start gap-2 md:gap-3">
                                                                <BookOpen className="w-3 h-3 md:w-4 md:h-4 mt-1 text-blue-500 flex-shrink-0" />
                                                                <span className="font-medium">{topic.name}</span>
                                                            </div>
                                                            <p className="text-slate-600 pl-5 md:pl-7">{topic.description}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 md:mt-8 text-center text-slate-600">
                    <p className="text-xs md:text-sm"> Bu roadmap sizning professional frontend developer bo'lishingiz uchun to'liq yo'l xaritasi <br /> <span className="font-semibold">300+ mavzu | 2 ta technology | Senior darajagacha</span> <br /> Omad tilaymiz! 🚀 </p>
                </div>
            </div>
        </div >
    );
};

export default CompleteRoadmap;
