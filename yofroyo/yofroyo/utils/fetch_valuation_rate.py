import frappe


@frappe.whitelist()
def fetch_valuation_rate(**args):
    item_code = args.get('item_code')
    data = {}
    sql_query = """
        SELECT
            ROUND(valuation_rate,4) AS valuation_rate
        FROM
            `tabStock Ledger Entry`
        WHERE
            item_code = %s AND is_cancelled = 0
        ORDER BY
            posting_date DESC, posting_time DESC
        LIMIT 1
    """
    result = frappe.db.sql(sql_query, (item_code,), as_dict=True)

    if result:
        valuation_rate = result[0].get('valuation_rate')
        data.update(
            {
                "valuation_rate": valuation_rate if valuation_rate else 0
            }
        )

    return data
