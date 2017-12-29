<%--
  Created by IntelliJ IDEA.
  User: user
  Date: 2017/12/9
  Time: 16:23
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="../common/tagLibs.jsp" %>
<%@ include file="../common/head.jsp" %>
<%@ include file="../common/menu.jsp" %>
<%@ include file="../common/footer.jsp" %>

<!DOCTYPE html>
<html>
<head>
    <title>layout 后台大布局 - Layui</title>
</head>
<body class="layui-layout-body">
<div class="layui-layout layui-layout-admin">

    <div class="layui-body">
        <!-- 内容主体区域 -->
        <div style="padding: 15px;">

            <form class="layui-form layui-form-pane1" action="">

                <div class="layui-form-item layui-inline">
                    <label class="layui-form-label">输入框</label>
                    <div class="layui-input-block">
                        <input type="text" name="xxx " autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-form-item layui-inline">
                    <label class="layui-form-label">输入框</label>
                    <div class="layui-input-block">
                        <input type="text" name="arr[]" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-form-item">
                    <label class="layui-form-label">输入框</label>
                    <div style="width:260px"  class="layui-input-block">
                        <input type="text" name="arr[]" autocomplete="off" class="layui-input">
                    </div>
                </div>
                <div class="layui-form-item">
                    <div class="layui-input-block">
                        <button class="layui-btn" lay-submit lay-filter="*">立即提交</button>
                        <button type="reset" class="layui-btn layui-btn-primary">重置</button>
                    </div>
                </div>
            </form>

            <div id="pTable" style="width: 1200px;">
                <table class="layui-table" id="layui_table_id" lay-filter="test">
                </table>
                <div id="laypage"></div>
            </div>

        </div>
    </div>


</div>


<script>
    //JavaScript代码区域
    layui.use('element', function(){
        var element = layui.element;

    });


    var limitcount = 10;
    var curnum = 1;
    //列表查询方法
    function productsearch(productGroupId,start,limitsize) {
        layui.use(['table','laypage','laydate'], function(){
            var table = layui.table,
                    laydate=layui.laydate,
                    laypage = layui.laypage;
            table.render({
                elem: '#layui_table_id'
                , url: '${ctx}/test/getTestData?pId='+productGroupId+'&tPage='+ start+'&tNumber=' + limitsize
                /*, where:{pagename:start,pagelimit:limitsize} //传参*/
                ,cols: [[
                    {type: 'checkbox', fixed: 'left'}
                    ,{field:'id', title:'ID', width:80, fixed: 'left', unresize: true, sort: true}
                    ,{field:'username', title:'用户名', width:120, edit: 'text', templet: '#usernameTpl'}
                    ,{field:'email', title:'邮箱', width:150}
                    ,{field:'sex', title:'性别', width:80, edit: 'text', sort: true}
                    ,{field:'city', title:'城市', width:100}
                    ,{field:'sign', title:'签名'}
                    ,{field:'experience', title:'积分', width:80, sort: true}
                    ,{field:'ip', title:'IP', width:120}
                    ,{field:'logins', title:'登入次数', width:100, sort: true}
                    ,{field:'joinTime', title:'加入时间', width:120}
                    ,{fixed: 'right', title:'操作', toolbar: '#barDemo', width:150}
                ]]
                , page: false
                , height: 430
                ,done: function(res, curr, count){
                    //如果是异步请求数据方式，res即为你接口返回的信息。
                    //如果是直接赋值的方式，res即为：{data: [], count: 99} data为当前页数据、count为数据总长度
                    laypage.render({
                        elem:'laypage'
                        ,count:count
                        ,curr:curnum
                        ,limit:limitcount
                        ,layout: ['prev', 'page', 'next', 'skip','count','limit']
                        ,jump:function (obj,first) {
                            if(!first){
                                curnum = obj.curr;
                                limitcount = obj.limit;
                                //console.log("curnum"+curnum);
                                //console.log("limitcount"+limitcount);
                                //layer.msg(curnum+"-"+limitcount);
                                productsearch(productGroupId,curnum,limitcount);
                            }
                        }
                    })
                }
            })

            //监听工具条
            table.on('tool(test)', function(obj){ //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
                var data = obj.data //获得当前行数据
                        ,layEvent = obj.event; //获得 lay-event 对应的值
                if(layEvent === 'detail'){
                    viewLableInfo(data.attrId);
                    layer.msg(data.attrId);
                } else if(layEvent === 'del'){
                    layer.msg('删除');
                } else if(layEvent === 'edit'){
                    layer.msg('编辑操作');
                }
            });
            //常规用法
            laydate.render({
                elem: '#createDate'
            });
            //常规用法
            laydate.render({
                elem: '#processingTime'
            });

        });
    }
    var pId = '${pGBean.pgId }';
    productsearch(pId, curnum, limitcount);

</script>
</body>
</html>
