/*
 * Copyright (C) 2005 - 2030 YGSoft.Inc All Rights Reserved.
 * YGSoft.Inc PROPRIETARY/CONFIDENTIAL.Use is subject to license terms.
 */
package com.ygsoft.necp.mapp.std.order.web.service.domain.model;
import java.util.Date;
import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Index;
import javax.persistence.Table;

import com.ygsoft.ecp.core.framework.annotations.Topic;
import com.ygsoft.necp.component.genentity.domain.model.GenBizEntity;
import java.util.List;
import javax.persistence.Transient;
import com.ygsoft.necp.mapp.std.order.web.service.domain.model.OrderInfo;

/**
 * SellOrder的POJO类.<br>
 * 
 * @author 04192213 <br>
 * @version 1.0.0 2022-10-05 22:09:23<br>
 * @since JDK 1.8.0_144
 */
@Entity
@Table(name = "SELLORDER", indexes = {})
@Topic(classId = "aa1", typeId = "sellorder1")
public class SellOrder extends GenBizEntity {
	/**
	 * 序列化版本.
	 */
	private static final long serialVersionUID = 1L;
												
	/**
	 * 发货时间.
	 */
	private Date fhsj;
											
	/**
	 * 订单编号.
	 */
	private String dsbh;
											
	/**
	 * 订单状态.
	 */
	private int dszt;
											
	/**
	 * 收货人地址.
	 */
	private String shrdz;
											
	/**
	 * 收货时间.
	 */
	private Date shsj;
											
	/**
	 * 订单金额.
	 */
	private BigDecimal dsje;
											
	/**
	 * 订单备注.
	 */
	private String dsbz;
											
	/**
	 * 订单日期.
	 */
	private Date dsrq;
											
	/**
	 * 快递单号.
	 */
	private String kdsh;
											
	/**
	 * 收货电话.
	 */
	private String shdh;
											
	/**
	 * 收货人.
	 */
	private String shr;
											
	/**
	 * 订单详情.
	 */
	private List<OrderInfo> dsxq;
	
	/**
     * 发货时间的get方法
     * @return fhsj
     */
	@Column(name = "fhsj", nullable = true)
    public Date getFhsj() {
        return fhsj;
    }
		
    /**
     * 设置发货时间.
     * @param fhsj
     */
    public void setFhsj(final Date newFhsj) {
		this.fhsj = newFhsj;
	}
	
	/**
     * 订单编号的get方法
     * @return dsbh
     */
	@Column(name = "dsbh", nullable = false, length = 50)
    public String getDsbh() {
        return dsbh;
    }
		
    /**
     * 设置订单编号.
     * @param dsbh
     */
    public void setDsbh(final String newDsbh) {
		this.dsbh = newDsbh;
	}
	
	/**
     * 订单状态的get方法
     * @return dszt
     */
	@Column(name = "dszt", nullable = true)
    public int getDszt() {
        return dszt;
    }
		
    /**
     * 设置订单状态.
     * @param dszt
     */
    public void setDszt(final int newDszt) {
		this.dszt = newDszt;
	}
	
	/**
     * 收货人地址的get方法
     * @return shrdz
     */
	@Column(name = "shrdz", nullable = true, length = 50)
    public String getShrdz() {
        return shrdz;
    }
		
    /**
     * 设置收货人地址.
     * @param shrdz
     */
    public void setShrdz(final String newShrdz) {
		this.shrdz = newShrdz;
	}
	
	/**
     * 收货时间的get方法
     * @return shsj
     */
	@Column(name = "shsj", nullable = true)
    public Date getShsj() {
        return shsj;
    }
		
    /**
     * 设置收货时间.
     * @param shsj
     */
    public void setShsj(final Date newShsj) {
		this.shsj = newShsj;
	}
	
	/**
     * 订单金额的get方法
     * @return dsje
     */
	@Column(name = "dsje", nullable = true, precision = 18, scale = 2)
    public BigDecimal getDsje() {
        return dsje;
    }
		
    /**
     * 设置订单金额.
     * @param dsje
     */
    public void setDsje(final BigDecimal newDsje) {
		this.dsje = newDsje;
	}
	
	/**
     * 订单备注的get方法
     * @return dsbz
     */
	@Column(name = "dsbz", nullable = true, length = 50)
    public String getDsbz() {
        return dsbz;
    }
		
    /**
     * 设置订单备注.
     * @param dsbz
     */
    public void setDsbz(final String newDsbz) {
		this.dsbz = newDsbz;
	}
	
	/**
     * 订单日期的get方法
     * @return dsrq
     */
	@Column(name = "dsrq", nullable = true)
    public Date getDsrq() {
        return dsrq;
    }
		
    /**
     * 设置订单日期.
     * @param dsrq
     */
    public void setDsrq(final Date newDsrq) {
		this.dsrq = newDsrq;
	}
	
	/**
     * 快递单号的get方法
     * @return kdsh
     */
	@Column(name = "kdsh", nullable = true, length = 50)
    public String getKdsh() {
        return kdsh;
    }
		
    /**
     * 设置快递单号.
     * @param kdsh
     */
    public void setKdsh(final String newKdsh) {
		this.kdsh = newKdsh;
	}
	
	/**
     * 收货电话的get方法
     * @return shdh
     */
	@Column(name = "shdh", nullable = false, length = 50)
    public String getShdh() {
        return shdh;
    }
		
    /**
     * 设置收货电话.
     * @param shdh
     */
    public void setShdh(final String newShdh) {
		this.shdh = newShdh;
	}
	
	/**
     * 收货人的get方法
     * @return shr
     */
	@Column(name = "shr", nullable = false, length = 50)
    public String getShr() {
        return shr;
    }
		
    /**
     * 设置收货人.
     * @param shr
     */
    public void setShr(final String newShr) {
		this.shr = newShr;
	}
	
	/**
     * 订单详情的get方法
     * @return dsxq
     */
	@Transient
	public List<OrderInfo> getDsxq() {
		return dsxq;
	}
		
    /**
     * 设置订单详情.
     * @param dsxq
     */
	public void setDsxq(final List<OrderInfo> newDsxq) {
		this.dsxq = newDsxq;
	}
}
