import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const defaultProduct = {
  name: "",
  sku: "",
  category: "",
  brand: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  barcode: "",
  lowStockThreshold: "10",
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("ims_token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("ims_user") || "null"));
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [productForm, setProductForm] = useState(defaultProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canManageProducts = useMemo(() => ["admin", "manager"].includes(user?.role), [user?.role]);

  const loadData = async (activeToken) => {
    const [dashboardData, productsData, notificationsData, meData] = await Promise.all([
      api.dashboard(activeToken),
      api.products(activeToken, "page=1&limit=15"),
      api.notifications(activeToken),
      api.me(activeToken),
    ]);

    setDashboard(dashboardData);
    setProducts(productsData.items || []);
    setNotifications(notificationsData || []);
    setUser(meData.user);
    localStorage.setItem("ims_user", JSON.stringify(meData.user));
  };

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError("");
    loadData(token)
      .catch((err) => {
        setError(err.message);
        logout();
      })
      .finally(() => setLoading(false));
  }, [token]);

  const updateAuthField = (field, value) => {
    setAuthForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = authMode === "register"
        ? authForm
        : { email: authForm.email, password: authForm.password };

      const data = authMode === "register"
        ? await api.register(payload)
        : await api.login(payload);

      localStorage.setItem("ims_token", data.token);
      localStorage.setItem("ims_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setMessage(authMode === "register" ? "Account created" : "Welcome back");
      setAuthForm({ name: "", email: "", password: "", role: "staff" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("ims_token");
    localStorage.removeItem("ims_user");
    setToken("");
    setUser(null);
    setDashboard(null);
    setProducts([]);
    setNotifications([]);
  };

  const refreshProducts = async () => {
    const data = await api.products(token, "page=1&limit=15");
    setProducts(data.items || []);
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.createProduct(token, {
        ...productForm,
        purchasePrice: Number(productForm.purchasePrice),
        sellingPrice: Number(productForm.sellingPrice),
        quantity: Number(productForm.quantity),
        lowStockThreshold: Number(productForm.lowStockThreshold),
      });
      setProductForm(defaultProduct);
      await refreshProducts();
      setMessage("Product created successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.deleteProduct(token, id);
      await refreshProducts();
      setMessage("Product deleted");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="shell auth-shell">
        <section className="auth-card">
          <p className="kicker">Inventory Management System</p>
          <h1>Warehouse Control Center</h1>
          <p className="subtitle">Secure role-based access for admins, managers, and staff.</p>

          <div className="auth-switch">
            <button
              type="button"
              className={authMode === "login" ? "active" : ""}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === "register" ? "active" : ""}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <input
                placeholder="Full name"
                value={authForm.name}
                onChange={(e) => updateAuthField("name", e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Work email"
              value={authForm.email}
              onChange={(e) => updateAuthField("email", e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => updateAuthField("password", e.target.value)}
              required
            />
            {authMode === "register" && (
              <select value={authForm.role} onChange={(e) => updateAuthField("role", e.target.value)}>
                <option value="staff">Staff</option>
                <option value="manager">Inventory Manager</option>
                <option value="admin">Admin</option>
              </select>
            )}
            <button type="submit" disabled={loading}>{loading ? "Please wait..." : authMode}</button>
          </form>

          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="success">{message}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="shell app-shell">
      <header className="topbar">
        <div>
          <p className="kicker">Operations Dashboard</p>
          <h1>Inventory Command Grid</h1>
          <p className="subtitle">Live stock visibility, sales signals, and product controls.</p>
        </div>
        <div className="user-box">
          <p>{user?.name}</p>
          <small>{user?.role}</small>
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success">{message}</p> : null}

      {loading && !dashboard ? <p className="loading">Loading dashboard...</p> : null}

      {dashboard && (
        <section className="stat-grid">
          <article><h3>Total Products</h3><p>{dashboard.totalProducts}</p></article>
          <article><h3>Total Categories</h3><p>{dashboard.totalCategories}</p></article>
          <article><h3>Low Stock Items</h3><p>{dashboard.lowStockItems.length}</p></article>
          <article><h3>Today's Sales</h3><p>${dashboard.todaysSales.toFixed(2)}</p></article>
          <article><h3>Monthly Revenue</h3><p>${dashboard.monthlyRevenue.toFixed(2)}</p></article>
          <article><h3>Inventory Value</h3><p>${dashboard.inventoryValue.toFixed(2)}</p></article>
        </section>
      )}

      <section className="content-grid">
        <article className="panel">
          <h2>Products</h2>
          <p className="subtitle">SKU, barcode, stock, and pricing overview.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Sell Price</th>
                  {canManageProducts ? <th>Action</th> : null}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category || "-"}</td>
                    <td className={product.quantity <= product.lowStockThreshold ? "danger" : ""}>{product.quantity}</td>
                    <td>${product.sellingPrice}</td>
                    {canManageProducts ? (
                      <td>
                        <button type="button" className="ghost danger-btn" onClick={() => handleDeleteProduct(product._id)}>
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h2>Notifications</h2>
          <p className="subtitle">Low stock and operational alerts.</p>
          <ul className="notice-list">
            {notifications.length === 0 ? <li>No alerts right now.</li> : null}
            {notifications.slice(0, 8).map((item) => (
              <li key={item._id}>
                <strong>{item.title}</strong>
                <span>{item.message}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {canManageProducts ? (
        <section className="panel form-panel">
          <h2>Create Product</h2>
          <form className="product-form" onSubmit={handleProductSubmit}>
            <input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required />
            <input placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm((p) => ({ ...p, sku: e.target.value }))} required />
            <input placeholder="Category" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} />
            <input placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))} />
            <input type="number" step="0.01" min="0" placeholder="Purchase Price" value={productForm.purchasePrice} onChange={(e) => setProductForm((p) => ({ ...p, purchasePrice: e.target.value }))} required />
            <input type="number" step="0.01" min="0" placeholder="Selling Price" value={productForm.sellingPrice} onChange={(e) => setProductForm((p) => ({ ...p, sellingPrice: e.target.value }))} required />
            <input type="number" min="0" placeholder="Quantity" value={productForm.quantity} onChange={(e) => setProductForm((p) => ({ ...p, quantity: e.target.value }))} required />
            <input placeholder="Barcode" value={productForm.barcode} onChange={(e) => setProductForm((p) => ({ ...p, barcode: e.target.value }))} />
            <input type="number" min="0" placeholder="Low Stock Threshold" value={productForm.lowStockThreshold} onChange={(e) => setProductForm((p) => ({ ...p, lowStockThreshold: e.target.value }))} />
            <button type="submit" disabled={loading}>{loading ? "Saving..." : "Add Product"}</button>
          </form>
        </section>
      ) : null}
    </main>
  );
}

export default App;
