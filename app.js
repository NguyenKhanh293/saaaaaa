/* =========================
   ESCAPE HTML (chống lỗi/gãy UI)
========================= */
function esc(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/* =========================
   DATABASE (localStorage)
========================= */
let customers = JSON.parse(localStorage.getItem("customers") || "[]");
let editingIndex = null;

/* =========================
   Danh sách 47 都道府県
========================= */
const prefectures = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県",
  "埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県",
  "佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

/* =========================
   LOAD PREFECTURES
========================= */
function loadPrefectures() {
    const addPref = document.getElementById("prefecture");
    const searchPref = document.getElementById("search-prefecture");

    [addPref, searchPref].forEach(pref => {
        pref.innerHTML = "<option value=''>-- 都道府県 --</option>";
        prefectures.forEach(p => {
            const op = document.createElement("option");
            op.value = p;
            op.textContent = p;
            pref.appendChild(op);
        });
    });
}

/* =========================
   SCREEN CONTROL
========================= */
function showScreen(id) {
    document.querySelectorAll("main > section").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

/* =========================
   SAVE / RESET DB
========================= */
function saveDB() {
    localStorage.setItem("customers", JSON.stringify(customers));
}

function resetAddForm() {
    document.getElementById("customer-form").reset();
    editingIndex = null;
    document.getElementById("editing-index").value = "";
    document.getElementById("btn-save").textContent = "Lưu";
}

/* =========================
   LOGIN / LOGOUT
========================= */
document.getElementById("login-btn").addEventListener("click", () => {
    const id = document.getElementById("login-id").value.trim();
    const pass = document.getElementById("login-pass").value.trim();

    if (id === "admin" && pass === "1234") {
        document.getElementById("login-error").textContent = "";
        showScreen("main-menu");
    } else {
        document.getElementById("login-error").textContent = "ID hoặc mật khẩu sai!";
    }
});

document.getElementById("btn-logout").addEventListener("click", () => {
    showScreen("login-screen");
});

/* =========================
   NAVIGATION BUTTONS
========================= */
document.getElementById("btn-show-add").addEventListener("click", () => {
    resetAddForm();
    showScreen("add-menu");
});

document.getElementById("btn-back-from-add").addEventListener("click", () => {
    showScreen("main-menu");
});

document.getElementById("btn-show-search").addEventListener("click", () => {
    renderSearchResults(customers);
    showScreen("search-menu");
});

document.getElementById("btn-back-from-search").addEventListener("click", () => {
    showScreen("main-menu");
});

/* =========================
   SAVE CUSTOMER
========================= */
document.getElementById("customer-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value.trim(),
        dob: document.getElementById("dob").value,
        phone: document.getElementById("phone").value.trim(),
        company: document.getElementById("company").value.trim(),
        companyPhone: document.getElementById("company-phone").value.trim(),
        zipcode: document.getElementById("zipcode").value.trim(),
        prefecture: document.getElementById("prefecture").value,
        city: document.getElementById("city-text").value.trim(),
        chome: document.getElementById("chome").value.trim(),
        ban: document.getElementById("ban").value.trim(),
        go: document.getElementById("go").value.trim(),
        building: document.getElementById("building").value.trim(),
        paymentMonth: document.getElementById("payment-month").value,
        paid: document.getElementById("paid").value
    };

    if (!data.name || !data.prefecture || !data.city) {
        alert("Tên, Tỉnh và Thành phố không được để trống!");
        return;
    }

    if (editingIndex === null) {
        customers.push(data);
    } else {
        customers[Number(editingIndex)] = data;
    }

    saveDB();
    alert("Đã lưu thành công!");
    resetAddForm();
});

/* =========================
   EDIT CUSTOMER
========================= */
function editCustomer(index) {
    const c = customers[index];
    editingIndex = index;
    document.getElementById("editing-index").value = index;

    for (let key in c) {
        if (document.getElementById(key.replace(/([A-Z])/g, "-$1").toLowerCase())) {
            document.getElementById(key.replace(/([A-Z])/g, "-$1").toLowerCase()).value = c[key];
        }
    }

    document.getElementById("btn-save").textContent = "Cập nhật";
    showScreen("add-menu");
}

/* =========================
   DELETE CUSTOMER
========================= */
function deleteCustomer(index) {
    if (confirm("Bạn có chắc muốn xóa?")) {
        customers.splice(index, 1);
        saveDB();
        renderSearchResults(customers);
    }
}

/* =========================
   RENDER SEARCH RESULTS
========================= */
function renderSearchResults(list) {
    const box = document.getElementById("search-results");

    if (!list.length) {
        box.innerHTML = "<p>Không tìm thấy khách hàng.</p>";
        return;
    }

    let html = `
    <table>
      <tr>
        <th>Họ tên</th>
        <th>ĐT</th>
        <th>Địa chỉ</th>
        <th>Hành động</th>
      </tr>`;

    list.forEach((c, i) => {
        const addr = `${c.prefecture} ${c.city} ${c.chome}-${c.ban}-${c.go} ${c.building}`;
        html += `
        <tr>
          <td>${esc(c.name)}</td>
          <td>${esc(c.phone)}</td>
          <td>${esc(addr)}</td>
          <td>
            <button onclick="editCustomer(${i})">Sửa</button>
            <button style="background:#c62828" onclick="deleteCustomer(${i})">Xóa</button>
          </td>
        </tr>`;
    });

    html += "</table>";
    box.innerHTML = html;
}

/* =========================
   SEARCH FUNCTIONS
========================= */
document.getElementById("btn-search-name").addEventListener("click", () => {
    const key = document.getElementById("search-name").value.trim().toLowerCase();
    const results = customers.filter(c => c.name.toLowerCase().includes(key));
    renderSearchResults(results);
});

document.getElementById("btn-search-address").addEventListener("click", () => {
    const pref = document.getElementById("search-prefecture").value;
    const city = document.getElementById("search-city-text").value.trim();
    const chome = document.getElementById("search-chome").value.trim();

    const results = customers.filter(c =>
        (pref === "" || c.prefecture === pref) &&
        (city === "" || c.city.includes(city)) &&
        (chome === "" || c.chome === chome)
    );
    renderSearchResults(results);
});

document.getElementById("btn-search-zipcode").addEventListener("click", () => {
    const zip = document.getElementById("search-zipcode").value.trim();
    const results = customers.filter(c => c.zipcode === zip);
    renderSearchResults(results);
});

document.getElementById("btn-search-payment").addEventListener("click", () => {
    const month = document.getElementById("search-payment").value.trim();
    const results = customers.filter(c => c.paymentMonth === month);
    renderSearchResults(results);
});

/* =========================
   ZIPCODE API (Japan)
========================= */
function lookupZipcode() {
    const zip = document.getElementById("zipcode").value.replace("-", "").trim();

    if (zip.length !== 7)
        return alert("Mã bưu điện phải đủ 7 chữ số");

    fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`)
        .then(res => res.json())
        .then(data => {
            if (data.results && data.results[0]) {
                const r = data.results[0];
                document.getElementById("prefecture").value = r.address1 || "";
                document.getElementById("city-text").value =
                    (r.address2 || "") + (r.address3 || "");
            } else {
                alert("Không tìm thấy mã bưu điện.");
            }
        })
        .catch(() => alert("Lỗi kết nối API"));
}

document.getElementById("btn-lookup-zipcode").addEventListener("click", lookupZipcode);

/* =========================
   INIT
========================= */
window.onload = () => {
    loadPrefectures();

    // Load 24 tháng gần đây cho search payment
    const sel = document.getElementById("search-payment");
    const now = new Date();

    for (let i = 0; i < 24; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const val = `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}`;
        const op = document.createElement("option");
        op.value = val;
        op.textContent = val;
        sel.appendChild(op);
    }
};
