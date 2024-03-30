import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";

import { Construct } from 'constructs';

// ファイルを読み込むためのパッケージを import
import { readFileSync } from "fs";
import * as rds from "aws-cdk-lib/aws-rds";

export class CdkWordPressWorkShopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // vpcの宣言
    const vpc = new ec2.Vpc(this, "BlogVpc", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
    });

    // AWS Linux2
    const webServer1 = new ec2.Instance(this, "WordPressServer1", {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      // ec2インスタンスを配置するサブネットを指定、
      vpcSubnets: {subnetType: ec2.SubnetType.PUBLIC},
    });

    // user-data.shを読み込み変数に格納
    const script = readFileSync("./lib/resources/user-data.sh","utf-8");
    // EC2インスタンスにユーザーデータを追加
    webServer1.addUserData(script);

    // port80, 全てのIPアドレスからのアクセス許可
    webServer1.connections.allowFromAnyIpv4(ec2.Port.tcp(80));
    // ec2インスタンスアクセス用のIPアドレスを出力
    new CfnOutput(this, "WordPressServer1PublicIPAddress",{
      value: `http://${webServer1.instancePublicIp}`,
    });

    // RDSインスタンスを宣言
    const dbServer = new rds.DatabaseInstance(this, "WordPressDB",{
      vpc,
      engine: rds.DatabaseInstanceEngine.mysql({version: rds.MysqlEngineVersion.VER_8_0_31}),
    });
  }
}
