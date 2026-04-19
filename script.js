			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('./sw.js')
				.then(() => console.log("Service Worker zarejestrowany!"));
				}

		let promptCallback = null;
        let confirmCallback = null;

        function customPrompt(title, placeholder, callback) {
            document.getElementById('promptTitle').innerText = title;
            const input = document.getElementById('promptInput');
            input.value = "";
            input.placeholder = placeholder;
            promptCallback = callback;
            
            document.getElementById('promptModal').classList.add('show');
            document.getElementById('modalOverlay').classList.add('show');
            setTimeout(() => input.focus(), 100);
        }

        document.getElementById('promptConfirmBtn').onclick = function() {
            const val = document.getElementById('promptInput').value;
            if (val && val.trim() !== "" && promptCallback) {
                promptCallback(val.trim());
                closePromptModal();
            }
        };

        document.getElementById('promptInput').onkeydown = function(e) {
            if (e.key === 'Enter') document.getElementById('promptConfirmBtn').click();
        };

        function closePromptModal() {
            document.getElementById('promptModal').classList.remove('show');
            document.getElementById('modalOverlay').classList.remove('show');
            promptCallback = null;
        }

        function customConfirm(title, message, callback) {
            document.getElementById('confirmTitle').innerText = title;
            document.getElementById('confirmMessage').innerText = message;
            confirmCallback = callback;
            
            document.getElementById('confirmModal').classList.add('show');
            document.getElementById('modalOverlay').classList.add('show');
        }

        document.getElementById('confirmAcceptBtn').onclick = function() {
            if (confirmCallback) {
                confirmCallback();
                closeConfirmModal();
            }
        };

        function closeConfirmModal() {
            document.getElementById('confirmModal').classList.remove('show');
            document.getElementById('modalOverlay').classList.remove('show');
            confirmCallback = null;
        }

        function closeAllModals() {
            closeProjectInfo();
            closePromptModal();
            closeConfirmModal();
        }

        document.addEventListener("DOMContentLoaded", function () {
            const darkModeCheckbox = document.getElementById('darkModeCheckbox');
            if (localStorage.getItem("darkMode") === "true") {
                document.body.classList.add("dark-mode");
                if (darkModeCheckbox) darkModeCheckbox.checked = true;
            }
            loadLists();
        });

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", isDarkMode);
            document.getElementById('darkModeCheckbox').checked = isDarkMode;
        }

        function updateClock() {
            document.getElementById('clock').innerText = new Date().toLocaleTimeString();
        }
        setInterval(updateClock, 1000);
        updateClock();

        function showProjectInfo() {
            document.getElementById('projectInfo').classList.add('show');
            document.getElementById('modalOverlay').classList.add('show');
        }

        function closeProjectInfo() {
            document.getElementById('projectInfo').classList.remove('show');
            document.getElementById('modalOverlay').classList.remove('show');
        }

        function createNewList() {
            customPrompt('Create New List', 'Enter list name...', (listName) => {
                const listContainer = createListElement(listName);
                document.getElementById('lists-container').prepend(listContainer);
                saveLists();
            });
        }

        function createListElement(name) {
            const listContainer = document.createElement("div");
            listContainer.classList.add("list-container", "anim-enter");
            const listHeader = document.createElement("div");
            listHeader.classList.add("list-header");
            const listTitle = document.createElement("h3");
			
			const titleSpan = document.createElement("span");
			titleSpan.classList.add("list-name-text");
            titleSpan.textContent = name;
            listTitle.appendChild(titleSpan);

            const editBtn = document.createElement("button");
            editBtn.classList.add("btn-edit-text");
            editBtn.textContent = "edit";
            editBtn.onclick = function() {
                customPrompt('Rename List', 'Enter new name...', (newName) => {
                    titleSpan.textContent = newName;
                    saveLists();
                });
            };
            listTitle.appendChild(editBtn);
            
            const actionsDiv = document.createElement("div");
            actionsDiv.classList.add("list-actions");
            
            const addItemBtn = document.createElement("button");
            addItemBtn.classList.add("btn-tonal");
            addItemBtn.textContent = "+ Add";
            addItemBtn.addEventListener("click", function () {
                customPrompt('Add New Item', '...', (itemText) => {
                    const newItem = createListItem(itemText, false);
                    listContainer.querySelector("ul").appendChild(newItem);
                    saveLists();
                });
            });
            
            const deleteListBtn = document.createElement("button");
            deleteListBtn.classList.add("btn-error");
            deleteListBtn.textContent = "Delete";
            deleteListBtn.addEventListener("click", function () {
                customConfirm('Delete List', 'Are you sure you want to delete this list?', () => {
                    listContainer.classList.add("anim-exit");
                    setTimeout(() => {
                        listContainer.remove();
                        saveLists();
                    }, 300);
                });
            });
            
            actionsDiv.appendChild(addItemBtn);
            actionsDiv.appendChild(deleteListBtn);
            listHeader.appendChild(listTitle);
            listHeader.appendChild(actionsDiv);
            const ul = document.createElement("ul");
            listContainer.appendChild(listHeader);
            listContainer.appendChild(ul);
            return listContainer;
        }

        function createListItem(text, isChecked) {
            const li = document.createElement("li");
            li.classList.add("anim-enter");
            if (isChecked) li.classList.add("checked");
            const span = document.createElement("span");
            span.textContent = text;
            const actionsDiv = document.createElement("div");
            actionsDiv.classList.add("item-actions");
            const checkboxBtn = document.createElement("button");
            checkboxBtn.classList.add("btn-check");
            checkboxBtn.innerHTML = "✓";
            checkboxBtn.addEventListener("click", function () {
                li.classList.toggle("checked");
                saveLists();
            });
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("btn-delete");
            deleteBtn.innerHTML = "✕";
            deleteBtn.addEventListener("click", function () {
                li.classList.add("anim-exit");
                setTimeout(() => {
                    li.remove();
                    saveLists();
                }, 300);
            });
            actionsDiv.appendChild(checkboxBtn);
            actionsDiv.appendChild(deleteBtn);
            li.appendChild(span);
            li.appendChild(actionsDiv);
            return li;
        }

        function saveLists() {
        const lists = document.querySelectorAll(".list-container");
        let data = [];
        lists.forEach(list => {
            if (list.classList.contains("anim-exit")) return;
            
            const nameElement = list.querySelector("h3 .list-name-text");
            let listName = nameElement ? nameElement.innerText : "Untitled List";
            
            let items = [];
            list.querySelectorAll("li").forEach(item => {
                if (item.classList.contains("anim-exit")) return;
                items.push({
                    text: item.querySelector("span").innerText,
                    checked: item.classList.contains("checked")
                });
            });
            data.push({ name: listName, items: items });
        });
        localStorage.setItem("savedLists", JSON.stringify(data));
    }

        function loadLists() {
            const savedData = localStorage.getItem("savedLists");
            if (!savedData) return;
            const data = JSON.parse(savedData);
            const container = document.getElementById('lists-container');
            data.forEach(listData => {
                const listContainer = createListElement(listData.name);
                listContainer.classList.remove("anim-enter"); 
                const ul = listContainer.querySelector("ul");
                listData.items.forEach(itemData => {
                    const newItem = createListItem(itemData.text, itemData.checked);
                    newItem.classList.remove("anim-enter");
                    ul.appendChild(newItem);
                });
                container.appendChild(listContainer);
            });
        }