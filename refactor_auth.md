# Panduan Integrasi Autentikasi Frontend (Next.js)

Dokumen ini berisi panduan teknis untuk tim _Frontend_ (Next.js) dalam melakukan integrasi dengan sistem otentikasi terbaru dari TG-Manager yang menggunakan **HttpOnly Cookies** untuk `refresh_token`.

Sistem otentikasi dirancang untuk sangat aman terhadap serangan **XSS (Cross-Site Scripting)**, karena _Refresh Token_ (yang umurnya lebih panjang) tidak pernah bisa diakses oleh JavaScript di sisi _browser_.

---

## 1. Arsitektur Otentikasi

- **Access Token**: Dikirimkan melalui JSON Response. Umurnya pendek. Anda harus menyimpannya di **Memory** (seperti Redux, Zustand, atau Context API). _Jangan menyimpannya di localStorage_.
- **Refresh Token**: Dikirimkan langsung oleh _backend_ melalui _header_ `Set-Cookie` dengan flag `HttpOnly`. Anda tidak perlu (dan tidak bisa) membaca token ini via JavaScript.
- **Mekanisme Pengiriman**: Setiap kali Anda melakukan `fetch` atau menggunakan `axios` ke _endpoint_ `Refresh` atau _endpoint_ terlindungi (_protected route_) yang butuh _cookie_, Anda **wajib** menyertakan kredensial agar _browser_ otomatis menyelipkan _cookie_ tersebut.

---

## 2. Setup Axios

Pastikan _instance_ Axios utama Anda di-setup dengan opsi `withCredentials: true`. Ini adalah kunci utama agar _browser_ mau mengirimkan _cookie_ HttpOnly ke _backend_.

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true, // WAJIB! Agar HttpOnly Cookie selalu dikirim
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
```

---

## 3. Alur Login

Saat _user_ melakukan _login_, Anda akan memanggil _endpoint_ `/auth/login`.

```javascript
const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    const { access_token, user, client, role } = response.data.data;

    // 1. Simpan access_token di Memory (Zustand/Redux/Context)
    setAccessToken(access_token);

    // 2. Simpan data profil user
    setUserProfile(user, client, role);

    // CATATAN: Anda TIDAK AKAN melihat refresh_token di response JSON
    // secara default, karena backend langsung memasukkannya ke Cookie browser!

    return true;
  } catch (error) {
    console.error("Login gagal", error);
    throw error;
  }
};
```

---

## 4. Alur Refresh Token (Menggunakan Interceptors)

Jika _Access Token_ kedaluwarsa, _backend_ akan mengembalikan status `401 Unauthorized`. Anda harus menangkap _error_ ini, memanggil _endpoint_ `/auth/refresh`, lalu mengulangi _request_ yang gagal tadi.

Gunakan **Axios Interceptors** untuk melakukannya secara otomatis:

```javascript
// Tambahkan Request Interceptor untuk menyisipkan Access Token
api.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFromMemory(); // Ambil dari Zustand/Redux
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Tambahkan Response Interceptor untuk mekanisme Refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 dan bukan saat mencoba login/refresh itu sendiri
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Panggil endpoint refresh. Karena axios di-set withCredentials: true,
        // cookie refresh_token akan otomatis terkirim.
        const res = await api.post("/auth/refresh");

        const newAccessToken = res.data.data.access_token;

        // Simpan token baru ke memory
        setAccessToken(newAccessToken);

        // Ulangi request-request yang sempat pending
        processQueue(null, newAccessToken);

        // Ulangi request asli
        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Jika refresh gagal (misal: refresh token expired),
        // bersihkan sesi dan redirect ke halaman login
        clearSession();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
```

---

## 5. Alur Logout

Untuk melakukan _logout_, panggil _endpoint_ `/auth/logout`. _Backend_ akan menghapus Cookie `refresh_token` dari sisi _browser_.

```javascript
const logout = async () => {
  try {
    // 1. Beritahu backend untuk menghapus HttpOnly Cookie
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Gagal logout di server", error);
  } finally {
    // 2. Hapus sesi di sisi frontend (hapus memory access token)
    clearSession();

    // 3. Arahkan kembali ke halaman login
    window.location.href = "/login";
  }
};
```

---

## 6. Tips Spesifik Server-Side Rendering (Next.js API & getServerSideProps)

Jika Anda melakukan `fetch` dari dalam **Server Component (App Router)** atau `getServerSideProps` (Pages Router), _browser_ **tidak** akan otomatis menyelipkan _cookie_ (karena kodenya berjalan di server Node.js).

Anda harus mengekstrak _cookie_ tersebut dari _request header_ (Next.js) dan memasangnya secara manual ke Axios/Fetch.

**Contoh pada Server Component (Next.js 13+ App Router):**

```javascript
import { cookies } from "next/headers";

async function getData() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh_token");

  // Karena SSR tidak punya access_token di memory, biasanya kita
  // me-refresh token terlebih dahulu menggunakan cookie refresh_token
  // atau langsung mengirim cookie tersebut jika API mendukungnya.

  const res = await fetch("http://localhost:3000/api/v1/tenant/profile", {
    headers: {
      Cookie: `refresh_token=${refreshToken?.value || ""}`,
    },
  });

  return res.json();
}
```

Mengingat SSR sedikit _tricky_ dengan arsitektur JWT, opsi terbaik untuk data yang sangat sensitif dan berlapis adalah mengambilnya secara **Client-Side** (menggunakan _interceptor_ di atas) dan membiarkan SSR hanya untuk halaman publik atau SEO.
