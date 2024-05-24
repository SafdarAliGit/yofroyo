import frappe
# import frappe
from frappe.model.document import Document
from frappe.model.naming import make_autoname
from yofroyo.yofroyo.doctype.utils_functions import get_doctype_by_field


class DailyDisposeOff(Document):
    def on_submit(self):
        pass
        doc = frappe.new_doc("Stock Entry")
        doc.stock_entry_type = "Material Issue"
        doc.purpose = "Material Issue"
        doc.posting_date = frappe.utils.nowdate()
        doc.daily_dispose_off = self.name

        for item in self.daily_dispose_off_items:
            it = doc.append("items", {})
            it.set_basic_rate_manually = 1
            it.s_warehouse = self.warehouse
            it.item_code = item.item_code
            it.qty = item.consumed_qty
            it.valuation_rate = item.rate
            it.basic_rate = item.rate
            it.basic_amount = item.amount

        try:
            doc.ignore_validation = True
            doc.save()
            doc.submit()
            self.stock_entry = doc.name
            self.save()
        except Exception as e:
            frappe.throw(frappe._("Error submitting Stock Entry: {0}".format(str(e))))

    def on_cancel(self):
        stock_entry = get_doctype_by_field('Stock Entry', 'daily_dispose_off', self.name)
        if stock_entry.docstatus != 2:
            stock_entry.cancel()
            frappe.db.commit()
        else:
            frappe.throw("Document is not in the 'Submitted' state.")
        if stock_entry.amended_from:
            new_name = int(stock_entry.name.split("-")[-1]) + 1
        else:
            new_name = f"{stock_entry.name}-{1}"
        make_autoname(new_name, 'Stock Entry')
