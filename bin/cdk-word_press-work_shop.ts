#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkWordPressWorkShopStack } from '../lib/cdk-word_press-work_shop-stack';

const app = new cdk.App();
new CdkWordPressWorkShopStack(app, 'CdkWordPressWorkShopStack');
