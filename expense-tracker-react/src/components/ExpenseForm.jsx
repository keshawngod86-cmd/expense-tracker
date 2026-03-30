import { useEffect, useState } from "react";

function ExpenseForm({ onAddExpense, editingExpense, onFinishEdit }) {
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        amount: "",
        date: "",
        description: "",
    });

    useEffect(() => {
        if (editingExpense) {
            setFormData({
                title: editingExpense.title,
                category: editingExpense.category,
                amount: editingExpense.amount,
                date: editingExpense.date,
                description: editingExpense.description,
            });
        }
    }, [editingExpense]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (
            formData.title === "" ||
            formData.category === "" ||
            formData.amount === "" ||
            formData.date === ""
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        const newExpense = {
            id: Date.now().toString(),
            title: formData.title,
            category: formData.category,
            amount: parseFloat(formData.amount),
            date: formData.date,
            description: formData.description,
        };

        onAddExpense(newExpense);

        setFormData({
            title: "",
            category: "",
            amount: "",
            date: "",
            description: "",
        });

        onFinishEdit();
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Coffee"
                />
            </div>

            <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                >
                    <option value="">Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="e.g. 12.50"
                        step="0.01"
                        min="0"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write a short note..."
                />
            </div>

            <button type="submit" className="primary-btn">
                {editingExpense ? "Update Expense" : "Add Expense"}
            </button>
        </form>
    );
}

export default ExpenseForm;