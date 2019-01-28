# yyl-seed-test-util

## 引入
```
npm i yyl-seed-test-util --save-dev
```

```
const tUtil = require('yyl-seed-test-util');
```

## API

### tUtil.buildFiles(ctx)

```
/**
 * 批量创建 空文件/目录
 * @param  {string|Array} ctx                path/to/dir/ 或者 path/to/file
 * @return {Promise}      then(r)
 *                        - r [Array]        创建的文件列表
 */
tUtil.buildFiles(ctx);
```

### tUtil.frag.init(path)

```
/**
 * 创建临时目录
 * @param  {String}  path                   临时目录
 * @return {Promise} then(iPath)
 *                   - iPath [String]       创建的目录路径
 */
tUtil.frag.init(path);
```

### tUtil.frag.build()
```
/**
 * 重置临时目录
 * @return {Promsie}
 */
tUtil.frag.build();
```

### tUtil.frag.destroy()
```
/**
 * 清除临时目录
 * @return {Promsie}
 */
tUtil.frag.destroy();
```

### tUtil.parseConfig(configPath)

```
/**
 * config 路径替换成绝对路径
 * @param  {String}  configPath   配置文件地址
 * @return {Promise} then(config)
 * @param  {Object}  config       解析后的 config
 */
tUtil.parseConfig(configPath)
```

### tUtil.server.start(root, port)

```
/**
 * 服务器启动
 * @param  {String}  root 服务器根目录路径
 * @param  {Number}  port 端口
 * @return {Promsie} then(null)
 */
tUtil.server.start(root, port)
```

### tUtil.server.abort()
```
/**
 * 服务器关闭
 * @return {Promsie} then(null)
 */
tUtil.server.abort()
```

### tUtil.server.getAppSync()
```
/**
 * 返回 server
 * @return {Object} app
 */
tUtil.getAppSync(url)
```

### tUtil.server.use(middleware)
```
/**
 * 使用中间件
 * @return {Void}
 */
tUtil.server.use(middleware)
```

### tUtil.hideUrlTail(url)
```
/**
 * 去掉 url 的 hash 和 query
 * @param  {String} url 待处理 url
 * @return {String} r   处理完成的 url
 */
tUtil.hideUrlTail(url)
```

## 历史记录
[这里](./history.md)
