<%--
  Created by IntelliJ IDEA.
  User: user
  Date: 2017/12/10
  Time: 9:52
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>菜单</title>
</head>
<body class="layui-layout-body">

<div class="layui-layout layui-layout-admin">

    <div class="layui-side layui-bg-black">
        <div class="layui-side-scroll">
            <!-- 左侧导航区域（可配合layui已有的垂直导航） -->
            <ul class="layui-nav layui-nav-tree"  lay-filter="test">
                <%--<li class="layui-nav-item layui-nav-itemed">
                    <a class="" href="javascript:;">所有商品</a>
                    <dl class="layui-nav-child">
                        <dd><a href="javascript:;">列表一</a></dd>
                        <dd><a href="javascript:;">列表二</a></dd>
                        <dd><a href="javascript:;">列表三</a></dd>
                        <dd><a href="">超链接</a></dd>
                    </dl>
                </li>
                <li class="layui-nav-item">
                    <a href="javascript:;">解决方案</a>
                    <dl class="layui-nav-child">
                        <dd><a href="javascript:;">列表一</a></dd>
                        <dd><a href="javascript:;">列表二</a></dd>
                        <dd><a href="">超链接</a></dd>
                    </dl>
                </li>
                <li class="layui-nav-item"><a href="">云市场</a></li>
                <li class="layui-nav-item"><a href="">发布商品</a></li>--%>

                <c:forEach var="menu" items="${showList}" varStatus="status">
                    <c:if test="${menu.func_type == 1}">
                        <c:if test="${status.index == 0}">
                            <li class="layui-nav-item layui-nav-itemed">
                        </c:if>
                        <c:if test="${status.index != 0}">
                            <li class="layui-nav-item">
                        </c:if>
                            <a class="" href="javascript:;">${menu.func_name}</a>
                            <dl class="layui-nav-child">
                                <c:forEach var="subMenu" items="${menu.subFunc}">
                                    <dd><a href="${subMenu.func_url}">${subMenu.func_name}</a></dd>
                                    <!--class="layui-this"-->
                                </c:forEach>
                            </dl>

                        </li>
                    </c:if>
                </c:forEach>
            </ul>
        </div>
    </div>
</div>

</body>
</html>
