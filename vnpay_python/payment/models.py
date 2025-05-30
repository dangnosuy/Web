from django.db import models


class Transaction(models.Model):
    order_id = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    username = models.CharField(max_length=100)
    order_desc = models.CharField(max_length=255)
    status = models.BooleanField(default=False)  # False: pending, True: success
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_transaction'  # tên bảng trong DB, nếu bạn muốn custom

    def __str__(self):
        return f"Txn {self.order_id} – {self.amount:,} VND"
    
class Users(models.Model):
    username = models.CharField(max_length=100)
    email = models.CharField(max_length=255)
    balance = models.DecimalField(max_digits=10, decimal_places=2)
    class Meta:
        db_table = 'users'