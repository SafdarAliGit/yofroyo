import frappe
from erpnext.stock.utils import get_stock_balance


@frappe.whitelist()
def get_stock(item_code, warehouse=None):
    if warehouse:
        current_stock = get_stock_balance(item_code, warehouse=warehouse)
        if current_stock:
            return current_stock
        else:
            return 0
    else:
        frappe.throw("Please select Warehouse")
