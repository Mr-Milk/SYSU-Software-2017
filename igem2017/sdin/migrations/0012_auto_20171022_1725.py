# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-22 17:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sdin', '0011_auto_20171022_1243'),
    ]

    operations = [
        migrations.AlterField(
            model_name='works',
            name='DefaultImg',
            field=models.URLField(default='static/img/Team_img/none.jpg'),
        ),
    ]