# 上传代码到服务器
# 在本地电脑终端执行（替换你的 IP）

# 方法1：直接用 scp 上传
# cd 到项目目录
# scp -r . root@149.28.23.92:/root/nexus/

# 方法2：压缩后上传更快
# cd 到项目目录
# tar czf nexus.tar.gz --exclude=node_modules --exclude=.next --exclude=.git .
# scp nexus.tar.gz root@149.28.23.92:/root/
# ssh root@149.28.23.92 'cd /root && tar xzf nexus.tar.gz && mv files nexus 2>/dev/null; mkdir -p nexus && mv * nexus 2>/dev/null; rm nexus.tar.gz'
