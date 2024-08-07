import frappe
from frappe.model.document import Document


class Invoice(Document):
    def before_save(self):
        self.posting_time = frappe.utils.now_datetime()

    def on_submit(self):

        posi = frappe.new_doc("POS Invoice")
        posi.ref_no = self.name
        posi.customer = self.customer
        posi.is_pos = 1
        posi.pos_profile = 'Dolmen Kiosk'
        posi.posting_date = self.posting_date
        posi.posting_time = self.posting_time
        posi.set_warehouse = 'Branch Dolmen - Y'
        posi.update_stock = 1
        # Append source item
        for item in self.items:
            it = posi.append("items", {})
            it.item_code = item.item
            it.qty = item.qty
            it.rate = item.rate
            it.amount = item.amount
        payment = posi.append("payments", {})
        payment.mode_of_payment = 'Cash'
        payment.amount = self.paid_amount
        try:
            posi.submit()
            self.ref_no = posi.name
            self.save()
        except Exception as e:
            frappe.throw(frappe._("Error submitting Stock Entry: {0}".format(str(e))))
