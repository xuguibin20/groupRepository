/*
 * Copyright (C) 2005 - 2030 YGSoft.Inc All Rights Reserved.
 * YGSoft.Inc PROPRIETARY/CONFIDENTIAL.Use is subject to license terms.
 */
package com.ygsoft.necp.mapp.std.order.web.boot;

import com.ygsoft.ecp.core.boot.Application;
import com.ygsoft.ecp.core.boot.datasource.DataSource;
import com.ygsoft.ecp.core.boot.run.ApplicationBuilder;
import com.ygsoft.ecp.core.mapp.MicroService;

/**
 * 项目启动类.<br>
 *
 * @author 04192213 <br>
 * @version 1.0.0 2022-10-05 22:09:25<br>
 * @since JDK 1.8.0_144
 */
@MicroService(serviceRegisterUrl = "http://127.0.0.1:8761", contextPath = "/order", port = 8080, region = "necp", name = "order.web", vipAddress = "/necp/mapp/order")
@DataSource
public class Main extends Application {

	public static void main(String[] args) {
		new ApplicationBuilder(Main.class).run(args);
	}
}
