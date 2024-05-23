# Copyright (c) 2024, TechVentures and contributors
# For license information, please see license.txt
import frappe
# import frappe
from frappe.model.document import Document


class DailyProduction(Document):
    def on_submit(self):
        pass
        # doc = frappe.new_doc("Stock Entry")
        #
        # for item in self.raw_materials:
        #     it = doc.append("items", {})
        #     it.set_basic_rate_manually = 1
        #     it.s_warehouse = self.warehouse
        #     it.item_code = item.item_code
        #     it.qty = item.qty
        #     it.valuation_rate = item.rate
        #     it.basic_rate = item.rate
        #     it.basic_amount = item.amount
        #
        # doc.stock_entry_type = "Repack"
        # doc.purpose = "Repack"
        # doc.posting_date = frappe.utils.nowdate()
        # doc.daily_production = self.name
        # it = doc.append("items", {})
        # it.set_basic_rate_manually = 1
        # it.s_warehouse = self.warehouse
        # it.item_code = self.finish_item
        # it.qty = self.finish_qty
        #
        # try:
        #     doc.ignore_validation = True
        #     doc.save()
        #     doc.submit()
        #     self.stock_entry = doc.name
        #     self.save()
        # except Exception as e:
        #     frappe.throw(frappe._("Error submitting Stock Entry: {0}".format(str(e))))
