<%--
  Created by IntelliJ IDEA.
  User: user
  Date: 2017/12/10
  Time: 10:45
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="WEB-INF/jsp/common/tagLibs.jsp" %>
<html>
<head>
    <title>登录</title>
    <link rel="stylesheet" href="${ctx}/js/css/layui.css">
    <script src="/js/layui.js"></script>
    <script src="/js/jquery.min.js"></script>


</head>
<body>
    <div style="margin: auto; position: absolute;width: 300px;height: 200px;overflow: auto; margin: auto; top: 0; left: 0; bottom: 0; right: 0; ">
        <form id="userLogin" method="post" action="${ctx}/user/login.do">
            <p class="layui-bg-green demo-carousel">
                账号：<input><br>
                密码：<input type="password"><br><br>
                <button class="layui-btn layui-btn-normal" onclick="userLogin">登录</button>
            </p>
        </form>
    </div>
</body>

<script>
    $(function(){

    });

    function userLogin() {
        $("#userLogin").submit();
    }
</script>
</html>
