import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2";

import { Construct } from 'constructs';

// ファイルを読み込むためのパッケージを import
import { readFileSync } from "fs";
import * as rds from "aws-cdk-lib/aws-rds";

// ALB を宣言するためのパッケージをimport
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
// target を追加するためのパッケージimport
import * as targets from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
// 自作コンストラクトを import
import { WebServerInstance } from './constructs/web-server-instance';

export class CdkWordPressWorkShopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // vpcの宣言
    const vpc = new ec2.Vpc(this, "BlogVpc", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
    });

    // コンストラクトを使用してインスタンスを宣言
    const webServer1 = new WebServerInstance(this, "webServer1",{
      vpc
    });
    // 2台目のインスタンスを宣言
    const webServer2 = new WebServerInstance(this, "webServer2",{
      vpc
    });

    // RDSインスタンスを宣言
    const dbServer = new rds.DatabaseInstance(this, "WordPressDB",{
      vpc,
      engine: rds.DatabaseInstanceEngine.mysql({version: rds.MysqlEngineVersion.VER_8_0_31}),
      // rds dbのインスタンスタイプを設定
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3,ec2.InstanceSize.SMALL),
      // rds db インスタンスのデータベース名を設定
      databaseName: "wordpress",
      multiAz: true,
    });

    // webserverからのアクセスを許可
    dbServer.connections.allowDefaultPortFrom(webServer1.instance);
    dbServer.connections.allowDefaultPortFrom(webServer2.instance);

    // ALBを宣言
    const alb = new elbv2.ApplicationLoadBalancer(this, "LoadBalancer",{
      vpc,
      internetFacing: true,
    });
    // リスナーを追加
    const listener = alb.addListener("Listener",{
      port:80,
    });
    // インスタンスをターゲットに追加
    listener.addTargets("ApplicationFleet",{
      port: 80,
      targets: [new targets.InstanceTarget(webServer1.instance, 80),
      // 2台目を追加
      new targets.InstanceTarget(webServer2.instance, 80)
      ],
      healthCheck:{
        path: "/wppincludes/images/blank.gif",
      },
    });

    // ALBからインスタンスへのアクセスを許可
    webServer1.instance.connections.allowFrom(alb, ec2.Port.tcp(80));
    webServer2.instance.connections.allowFrom(alb, ec2.Port.tcp(80));
  }
}
