# aws cdkでwordpressサーバーのデプロイ

https://catalog.workshops.aws/typescript-and-cdk-for-beginner/ja-JP/40-cdk-introduction/10-create-project/20-structure

### 


### userDataの作成

wordpressをインストールするためのスクリプトファイルを準備

- lib/ディレクトリの下にresourcesを作成
- user-data.shファイルを作成してコマンド実行

https://catalog.workshops.aws/typescript-and-cdk-for-beginner/ja-JP/40-cdk-introduction/20-wordpress/30-create-ec2

### 高可用性アーキテクチャの実現

#### 要件
- Application LoadBalancerを追加し、EC2インスタンスをターゲットに指定する
- 1台目と同じ設定を持つ2台目のEC2インスタンスを宣言する
- RDS DBインスタンスをMulti-AZに変更する

https://catalog.workshops.aws/typescript-and-cdk-for-beginner/ja-JP/40-cdk-introduction/20-wordpress/50-advanced

### 参考

