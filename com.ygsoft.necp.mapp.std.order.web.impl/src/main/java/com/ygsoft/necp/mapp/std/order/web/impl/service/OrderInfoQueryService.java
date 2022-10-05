/*
 * Copyright (C) 2005 - 2030 YGSoft.Inc All Rights Reserved.
 * YGSoft.Inc PROPRIETARY/CONFIDENTIAL.Use is subject to license terms.
 */
package com.ygsoft.necp.mapp.std.order.web.impl.service;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ygsoft.necp.component.genentity.spec.GenEntityQueryService;

import com.ygsoft.necp.mapp.std.order.web.service.domain.model.OrderInfo;
import com.ygsoft.necp.mapp.std.order.web.service.service.IOrderInfoQueryService;
import com.ygsoft.necp.mapp.std.order.web.service.context.IOrderInfoContext;

/**
 * OrderInfoQueryService查询服务类.<br>
 *
 * @author 04192213 <br>
 * @version 1.0.0 2022-10-05 22:09:23<br>
 * @since JDK 1.8.0_144
 */
@RestController
@RequestMapping("/necp/mapp/order/query/orderInfo")
public class OrderInfoQueryService extends GenEntityQueryService<OrderInfo, IOrderInfoContext>
		implements IOrderInfoQueryService {

}
