# twbsPagination
## **<font color=#c33>修改自twbs-pagination<br>調整成 vanilla javascript版本</font>**
## **新增參數backward, forward, backwardClass, forwardClass**

## 使用方式
```js
// 方式一：vanilla javascript形式，仿jQuery執行方式
selector.twbsPagination([options | method]);
// 方式二：jQuery形式，jQuery有無引入都可使用
$(selector).twbsPagination([options | method]);
```

### options
| 屬性 | 預設值 | 參數 | 說明 |
| - | - | - | - |
| totalPages | 1 | Number | 總頁數 |
| startPage | 1 | Number | 目前頁數 |
| visiblePages | 5 | Number | 顯示頁數 |
| initiateStartPageClick | true | Boolean | 套件初始化後先執行目前頁面的點擊事件 |
| hideOnlyOnePage | false | Boolean | 總頁數只有一頁時隱藏 |
| href | false | Boolean | 產生query string 或 '#' |
| pageVariable | '{{page}}' | String | 頁碼替換的模板 (沿用twbs，沒功能) |
| totalPagesVariable | '{{total_pages}}' | String | 總頁數替換的模板 (沿用twbs，沒功能) |
| page | null | String | 自訂頁碼標籤 (沿用twbs，沒功能) |
| first | 'First' | String | first(第一頁)按鈕的文字標籤 |
| prev | 'Previous' | String | previous(上一頁)按鈕的文字標籤 |
| next | 'Next' | String | next(下一頁)按鈕的文字標籤 |
| last | 'Last' | String | last(最後一頁)按鈕的文字標籤 |
| loop | false | Boolean | 分頁輪播 |
| onPageClick | null | Function | Click事件執行callback |
| paginationClass | 'pagination' | String | 套件的Class |
| firstClass | 'page-item first' | String | first(第一頁)按鈕的Class |
| prevClass | 'page-item prev' | String | previous(上一頁)按鈕的Class |
| nextClass | 'page-item next' | String | next(下一頁)按鈕的Class |
| lastClass | 'page-item last' | String | last(最後一頁)按鈕的Class |
| pageClass | 'page-item' | String | 數字頁碼按鈕的Class |
| activeClass | 'active' | String | active按鈕的Class |
| disabledClass | 'disabled' | String | disabled按鈕的Class |
| anchorClass | 'page-link' | String | 頁碼按鈕連結的Class |
| backward | 'backward' | String | backward(往前頁)按鈕的文字標籤 (往前頁數為visiblePages) |
| forward | 'forward' | String | forward(往後頁)按鈕的文字標籤 (往後頁數為visiblePages) |
| backwardClass | 'page-item backward' | String | backward(往前頁)按鈕的Class |
| forwardClass | 'page-item forward' | String | forward(往後頁)按鈕的Class |

### method
刪除套件內容
```js
selector.twbsPagination('destroy');
```
禁用
```js
selector.twbsPagination('disable');
```
啟動
```js
selector.twbsPagination('enable');
```
取得現在頁數(array)
```js
let currentPage = selector.twbsPagination('getCurrentPage');
```
取得總頁數(array)
```js
let totalPages = selector.twbsPagination('getTotalPages');
```