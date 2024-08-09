import frappe
from frappe.model.document import Document


class Invoice(Document):
    def before_save(self):
        self.posting_time = frappe.utils.now_datetime()

    def on_submit(self):
        # Ensure the POS Profile exists
        pos_profile = frappe.get_doc("POS Profile", "Dolmen Kiosk")

        # Create a new POS Invoice
        posi = frappe.new_doc("POS Invoice")
        posi.customer = self.customer
        posi.is_pos = 1
        posi.pos_profile = pos_profile.name
        posi.posting_date = self.posting_date
        posi.posting_time = self.posting_time
        posi.set_warehouse = pos_profile.warehouse
        posi.update_stock = 1

        # Append source items
        for item in self.items:
            it = posi.append("items", {})
            it.item_code = item.item
            it.qty = item.qty
            it.rate = item.rate
            it.amount = item.amount

        # Append payment details
        payment = posi.append("payments", {})
        payment.mode_of_payment = self.mop
        payment.amount = self.paid_amount

        try:
            posi.submit()
        except Exception as e:
            frappe.throw(frappe._("Error submitting POS Invoice: {0}".format(str(e))))

    def validate(self):
        # Fetch the POS profile from the current document
        pos_profile = self.pos_profile

        # Query to check if there is an open POS Opening Entry for the given POS profile
        pos_opening_entry = frappe.get_all(
            'POS Opening Entry',
            filters={
                'pos_profile': pos_profile,
                'status': 'Open'
            },
            fields=['name']
        )

        # Check if an entry is found
        if not pos_opening_entry:
            # Raise an exception if no open POS Opening Entry is found
            frappe.throw(
                'Please create a POS Opening Entry with status "Open" for the given POS Profile before saving or submitting.'
            )
