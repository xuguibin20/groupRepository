/*
 * Copyright (C) 2005 - 2030 YGSoft.Inc All Rights Reserved.
 * YGSoft.Inc PROPRIETARY/CONFIDENTIAL.Use is subject to license terms.
 */
package com.ygsoft.necp.mapp.std.order.web.service.context;


import com.ygsoft.necp.mapp.std.order.web.service.domain.model.SellOrder;
import com.ygsoft.necp.component.genentity.spec.IGenEntityContext;

/**
 * ISellOrderContext场景接口类.<br>
 *
 * @author 04192213 <br>
 * @version 1.0.0 2022-10-05 22:09:24<br>
 * @since JDK 1.8.0_144
 */
public interface ISellOrderContext extends IGenEntityContext<SellOrder, String> {



 	/**
 	 * 查询订单详情.
 	 *
	 * @param ddbh
	 *            订单编号
	 * @return SellOrder
 	 */
 	SellOrder queryOrderInfo(String ddbh);
 	/**
 	 * 查询订单.
 	 *
	 * @return String
 	 */
 	String query();
 	/**
 	 * 新增订单.
 	 *
	 * @param ddm
	 *            订单名
	 * @param shr
	 *            收货人
	 * @param shdz
	 *            收货地址
	 * @param shdh
	 *            收货人电话
	 * @param spxx
	 *            商品信息
	 * @return String
 	 */
 	String addOrder(String ddm, String shr, String shdz, String shdh, String spxx);
 	/**
 	 * 发货.
 	 *
	 * @param fhzt
	 *            发货状态
	 * @param fhdh
	 *            发货单号
	 * @return boolean
 	 */
 	boolean sendProduct(String fhzt, String fhdh);
 	/**
 	 * 取消订单.
 	 *
	 * @param ddbh
	 *            订单编号
	 * @return boolean
 	 */
 	boolean cancelOrder(String ddbh);
 	/**
 	 * 查询订单详情.
 	 *
	 * @param ddbh
	 *            订单编号
	 * @return SellOrder
 	 */
 	SellOrder queryOrderInfo(String ddbh);

}
