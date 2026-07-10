import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Svg, Path, Circle, G, Line, Defs, Rect } from '@react-pdf/renderer';
import { Challan, Company, Party } from '@/types';
import { numberToWords } from '@/lib/number-to-words';
import { getCompanyInitials } from '@/utils/getCompanyInitials';

// Register standard fonts
Font.register({
  family: 'Gujarati',
  fonts: [
    { src: '/fonts/NotoSansGujarati-Regular.ttf' },
    { src: '/fonts/NotoSansGujarati-Bold.ttf', fontWeight: 'bold' }
  ]
});

// Primary Theme Colors
const COLORS = {
  primary: '#5C3317', // Dark brown text and solid blocks
  secondary: '#915F33', // Lighter brown for borders and secondary accents
  accent: '#E63946', // Red for religious text
  background: '#FFFFFF',
  barBg: '#8C5724', // Medium brown for the address bar
  lightBg: '#FDFBF7', // Very light background if needed (optional)
  tableHead: '#5C3317',
  tableBorder: '#D2B48C',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    backgroundColor: '#FFFFFF',
    padding: 12, // Minimal page padding
    paddingTop: 10,
  },

  // --- HEADER ---
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4, // Compressed
  },
  gstinText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
  },
  religiousTextWrapper: {
    alignItems: 'center',
  },
  religiousText: {
    color: COLORS.accent,
    fontSize: 11,
    fontFamily: 'Gujarati',
    fontWeight: 'bold',
  },
  mobileText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
  },

  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    left: 10,
    top: -5,
  },
  companyInfo: {
    alignItems: 'center',
  },
  companyName: {
    fontSize: 28,
    fontFamily: 'Times-Roman',
    color: COLORS.primary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  companyTagline: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    marginTop: 1,
  },
  separatorWrapper: {
    alignItems: 'center',
    marginVertical: 3,
  },

  addressBar: {
    backgroundColor: COLORS.barBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    marginHorizontal: -12, // Match new padding
    marginBottom: 6,
  },
  addressText: {
    color: '#FFF',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginLeft: 4,
  },

  // --- CARDS (BILLED TO & INVOICE DETAILS) ---
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  card: {
    width: '49%',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    padding: 6,
    paddingTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginLeft: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  fieldLabel: {
    width: 55,
    fontSize: 8,
    color: '#000',
  },
  fieldLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    paddingBottom: 1,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    minHeight: 10,
  },

  // --- TABLE ---
  tableOuter: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    overflow: 'hidden', // to keep rounded corners with background colors
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.tableHead,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  th: {
    paddingVertical: 4,
    color: '#FFF',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thLast: {
    borderRightWidth: 0,
  },

  // Column Widths
  col1: { width: '8%' },
  col2: { width: '42%' },
  col3: { width: '12%' },
  col4: { width: '13%' },
  col5: { width: '13%' },
  col6: { width: '12%' },

  tableBodyRow: {
    flexDirection: 'row',
  },
  tdWrapper: {
    borderRightWidth: 1,
    borderRightColor: COLORS.tableBorder,
  },
  tdWrapperLast: {
    borderRightWidth: 0,
  },
  tdInner: {
    flexDirection: 'row',
    height: 12,
    alignItems: 'center',
  },
  tdText: {
    fontSize: 8,
    width: '100%',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  tdTextLeft: {
    textAlign: 'left',
    paddingLeft: 4,
  },
  tdTextRight: {
    textAlign: 'right',
    paddingRight: 4,
  },

  // Table Bottom Section
  tableBottomRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.tableBorder,
  },
  bottomLeft: {
    width: '75%', // covers col1-col5
    borderRightWidth: 1,
    borderRightColor: COLORS.tableBorder,
    padding: 6,
  },
  bottomRight: {
    width: '25%', // covers col6 and part of others
    flexDirection: 'column',
  },
  summaryFieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    width: 80,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  summaryValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    fontSize: 8,
    minHeight: 10,
  },

  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
  },
  taxLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  taxValue: { fontSize: 8 },

  totalBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 4,
    flex: 1,
    alignItems: 'center',
  },
  totalBlockText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },

  // --- BOTTOM CARDS ---
  bankSignatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bankCard: {
    width: '49%',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    padding: 6,
  },
  signatureCard: {
    width: '49%',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    padding: 6,
    justifyContent: 'space-between',
  },
  bankTextItem: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  signatureLineWrapper: {
    alignItems: 'center',
    marginTop: 15,
  },
  signatureLine: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 2,
  },
  signatureLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },

  // --- PREPARED / CHECKED BY ---
  prepCheckRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 4,
    padding: 4,
    marginBottom: 4,
  },
  prepCheckItem: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  prepCheckLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginRight: 5,
  },
  prepCheckLine: {
    width: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  prepCheckDivider: {
    width: 1,
    backgroundColor: COLORS.secondary,
    height: 8,
    marginHorizontal: 5,
  },

  // --- TERMS ---
  termsCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    padding: 6,
    minHeight: 75,
    marginBottom: 0, // removed buffer since footer is removed
  },
  termsLeft: {
    flex: 1,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  termBullet: {
    width: 8,
    fontSize: 6,
  },
  termText: {
    flex: 1,
    fontSize: 6,
  }
});

// --- ICONS ---
const PhoneIcon = () => (
  <Svg viewBox="0 0 24 24" width="10" height="10" style={{ marginRight: 4 }}>
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = () => (
  <Svg viewBox="0 0 24 24" width="14" height="14">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={COLORS.primary} />
  </Svg>
);

const DocIcon = () => (
  <Svg viewBox="0 0 24 24" width="14" height="14">
    <Path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill={COLORS.primary} />
  </Svg>
);

const MapPinIcon = () => (
  <Svg viewBox="0 0 24 24" width="12" height="12">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#FFF" />
  </Svg>
);

const BankIcon = () => (
  <Svg viewBox="0 0 24 24" width="14" height="14">
    <Path d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z" fill={COLORS.primary} />
  </Svg>
);

const PenIcon = () => (
  <Svg viewBox="0 0 24 24" width="14" height="14">
    <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill={COLORS.primary} />
  </Svg>
);

const DecorativeLine = () => (
  <Svg viewBox="0 0 200 10" width="150" height="8">
    <Line x1="0" y1="5" x2="85" y2="5" stroke={COLORS.secondary} strokeWidth="1" />
    <Circle cx="100" cy="5" r="3" stroke={COLORS.secondary} strokeWidth="1" fill="none" />
    <Line x1="115" y1="5" x2="200" y2="5" stroke={COLORS.secondary} strokeWidth="1" />
  </Svg>
);

const VTLogo = ({ companyName }: { companyName: string }) => {
  const initials = getCompanyInitials(companyName || '');
  
  let fontSize = 45;
  let y = 68;
  
  if (initials.length === 3) {
    fontSize = 32;
    y = 62;
  } else if (initials.length >= 4) {
    fontSize = 26;
    y = 59;
  }
  
  return (
    <Svg viewBox="0 0 100 100" width="55" height="55">
      <Circle cx="50" cy="50" r="46" fill="none" stroke={COLORS.secondary} strokeWidth="2" />
      <Circle cx="50" cy="50" r="42" fill="none" stroke={COLORS.secondary} strokeWidth="1" />
      <Text x="50" y={y} fill={COLORS.primary} textAnchor="middle" style={{ fontSize, fontFamily: 'Times-Roman', fontWeight: 'bold' }}>{initials}</Text>
    </Svg>
  );
};

interface ChallanPDFProps {
  challan: Challan;
  company: Company;
  party?: Party;
}

export function ChallanPDF({ challan, company, party }: ChallanPDFProps) {
  // Calculate totals
  const totalMeters = (challan.items || []).reduce((sum, item) => sum + (item.meter || 0), 0);
  const totalAmount = (challan.items || []).reduce((sum, item) => sum + (item.amount || 0), 0);

  // Pad items to exactly 10 rows for consistent table layout height
  const MAX_ROWS = 10;
  const displayItems = Array(MAX_ROWS).fill(null).map((_, i) => {
    return (challan.items && challan.items[i]) ? challan.items[i] : null;
  });

  const cgst = (totalAmount * 2.5) / 100;
  const sgst = (totalAmount * 2.5) / 100;
  const igst = 0;
  const grandTotal = totalAmount + cgst + sgst + igst;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>

        {/* --- HEADER --- */}
        <View style={styles.headerTopRow} wrap={false}>
          <Text style={styles.gstinText}>GSTIN : {company.gst_number || '-'}</Text>
          <View style={styles.religiousTextWrapper}>
            <Text style={styles.religiousText}>|| શ્રી ૧| ||</Text>
            <Text style={styles.religiousText}>|| શ્રી ગણેશાય નમઃ ||</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PhoneIcon />
            <Text style={styles.mobileText}>{company.phone || '-'}</Text>
          </View>
        </View>

        <View style={styles.headerMain}>
          <View style={styles.logoContainer}>
            <VTLogo companyName={company.name} />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{(company.name || '').toUpperCase()}</Text>
            <Text style={styles.companyTagline}>Manufacturers : Art Silk Cloth</Text>
            <View style={styles.separatorWrapper}>
              <DecorativeLine />
            </View>
          </View>
        </View>

        <View style={styles.addressBar}>
          <MapPinIcon />
          <Text style={styles.addressText}>{company.address || 'Survey No.8, Plot No.29/1, Mahaprabhu Nagar, Limbayat, Surat.'}</Text>
        </View>

        {/* --- CARDS SECTION --- */}
        <View style={styles.cardsContainer} wrap={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <UserIcon />
              <Text style={styles.cardTitle}>BILLED TO</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Name</Text>
              <Text style={{ fontSize: 9 }}> : </Text>
              <Text style={styles.fieldLine}>{party?.name || ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Address</Text>
              <Text style={{ fontSize: 9 }}> : </Text>
              <Text style={styles.fieldLine}>{party?.address || ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}></Text>
              <Text style={{ fontSize: 9 }}>   </Text>
              <Text style={styles.fieldLine}>{party?.city ? `${party.city}, ${party.state}` : ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>GST No.</Text>
              <Text style={{ fontSize: 9 }}> : </Text>
              <Text style={styles.fieldLine}>{party?.gst_number || ''}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <DocIcon />
              <Text style={styles.cardTitle}>INVOICE DETAILS</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Date</Text>
              <Text style={{ fontSize: 9 }}> : </Text>
              <Text style={styles.fieldLine}>{new Date(challan.date).toLocaleDateString('en-GB')}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Bill No.</Text>
              <Text style={{ fontSize: 9 }}> : </Text>
              <Text style={styles.fieldLine}>{challan.bill_number || ''}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Challan No.</Text>
              <Text style={{ fontSize: 9 }}> : </Text>
              <Text style={styles.fieldLine}>{challan.challan_number}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>HSN Code</Text>
              <Text style={{ fontSize: 9 }}> : </Text>
              <Text style={styles.fieldLine}>5407</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Broker</Text>
              <Text style={{ fontSize: 9 }}> : </Text>
              <Text style={styles.fieldLine}>{challan.broker || '-'}</Text>
            </View>
          </View>
        </View>

        {/* --- TABLE SECTION --- */}
        <View style={styles.tableOuter} wrap={false}>
          <View style={styles.tableHeader}>
            <View style={[styles.th, styles.col1]}><Text>SR. NO.</Text></View>
            <View style={[styles.th, styles.col2]}><Text>DESCRIPTION OF GOODS</Text></View>
            <View style={[styles.th, styles.col3]}><Text>TOTAL</Text><Text>PIECES</Text></View>
            <View style={[styles.th, styles.col4]}><Text>TOTAL</Text><Text>MTS./KGS</Text></View>
            <View style={[styles.th, styles.col5]}><Text>RATE PER</Text><Text>MTRS.</Text></View>
            <View style={[styles.th, styles.col6, styles.thLast]}><Text>AMOUNT</Text></View>
          </View>

          {/* Table Body (using absolute layout for columns to ensure perfect height matching) */}
          <View style={{ flexDirection: 'row', height: 120 }} wrap={false}>
            {/* SR NO */}
            <View style={[styles.tdWrapper, styles.col1]}>
              <View style={{ paddingTop: 4 }}>
                {displayItems.map((item, i) => (
                  <View key={`sr-${i}`} style={styles.tdInner}>
                    <Text style={styles.tdText}>{item ? (i + 1) : ' '}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* DESC */}
            <View style={[styles.tdWrapper, styles.col2]}>
              <View style={{ paddingTop: 4 }}>
                {displayItems.map((item, i) => (
                  <View key={`desc-${i}`} style={styles.tdInner}>
                    <Text style={[styles.tdText, styles.tdTextLeft]}>{item ? `${item.quality || ''} ${item.fabric_name || ''}`.trim() : ' '}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* PIECES */}
            <View style={[styles.tdWrapper, styles.col3]}>
              <View style={{ paddingTop: 4 }}>
                {displayItems.map((item, i) => (
                  <View key={`pcs-${i}`} style={styles.tdInner}>
                    <Text style={styles.tdText}>{item ? '1' : ' '}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* METERS */}
            <View style={[styles.tdWrapper, styles.col4]}>
              <View style={{ paddingTop: 4 }}>
                {displayItems.map((item, i) => (
                  <View key={`mtr-${i}`} style={styles.tdInner}>
                    <Text style={styles.tdText}>{item ? item.meter : ' '}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* RATE */}
            <View style={[styles.tdWrapper, styles.col5]}>
              <View style={{ paddingTop: 4 }}>
                {displayItems.map((item, i) => (
                  <View key={`rate-${i}`} style={styles.tdInner}>
                    <Text style={styles.tdText}>{item ? item.rate : ' '}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* AMOUNT */}
            <View style={[styles.tdWrapper, styles.col6, styles.tdWrapperLast]}>
              <View style={{ paddingTop: 4 }}>
                {displayItems.map((item, i) => (
                  <View key={`amt-${i}`} style={styles.tdInner}>
                    <Text style={[styles.tdText, styles.tdTextRight]}>{item ? (item.amount || 0).toFixed(2) : ' '}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Table Footer */}
          <View style={styles.tableBottomRow}>
            <View style={styles.bottomLeft}>
              <View style={styles.summaryFieldRow}>
                <Text style={styles.summaryLabel}>Delivered By</Text>
                <Text style={{ fontSize: 9 }}> : </Text>
                <Text style={styles.summaryValue}>{challan.driver_name || ''}</Text>
              </View>
              <View style={styles.summaryFieldRow}>
                <Text style={styles.summaryLabel}>Payment Within</Text>
                <Text style={{ fontSize: 9 }}> : </Text>
                <Text style={styles.summaryValue}>{challan.payment_within_value ? `${challan.payment_within_value} ${challan.payment_within_unit}` : ''}</Text>
              </View>
              <View style={styles.summaryFieldRow}>
                <Text style={styles.summaryLabel}>Due Date</Text>
                <Text style={{ fontSize: 9 }}> : </Text>
                <Text style={styles.summaryValue}>{challan.due_date ? new Date(challan.due_date).toLocaleDateString('en-GB') : ''}</Text>
              </View>
              <View style={styles.summaryFieldRow}>
                <Text style={styles.summaryLabel}>Rupees</Text>
                <Text style={{ fontSize: 9 }}> : </Text>
                <Text style={styles.summaryValue}>{numberToWords(Math.round(grandTotal))}</Text>
              </View>

              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: COLORS.primary }}>NO DYEING GUARANTEE</Text>
                <View style={{ marginTop: 2 }}>
                  <DecorativeLine />
                </View>
              </View>
            </View>

            <View style={styles.bottomRight}>
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>CGST  %</Text>
                <Text style={styles.taxValue}>{cgst.toFixed(2)}</Text>
              </View>
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>SGST  %</Text>
                <Text style={styles.taxValue}>{sgst.toFixed(2)}</Text>
              </View>
              <View style={[styles.taxRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.taxLabel}>IGST  %</Text>
                <Text style={styles.taxValue}>{igst.toFixed(2)}</Text>
              </View>
              <View style={styles.totalBlock}>
                <Text style={styles.totalBlockText}>TOTAL </Text>
                <Text style={styles.totalBlockText}>{grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- BANK & SIGNATURE CARDS --- */}
        <View style={styles.bankSignatureRow} wrap={false}>
          <View style={styles.bankCard}>
            <View style={styles.cardHeader}>
              <BankIcon />
              <Text style={styles.cardTitle}>BANK DETAILS</Text>
            </View>
            <Text style={styles.bankTextItem}>THE SUTEXT CO.OPERATIVE BANK LTD.</Text>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 4, borderRadius: 2, marginRight: 4, justifyContent: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 6 }}>A/C</Text>
              </View>
              <Text style={styles.bankTextItem}>A/C No.      : 001460011000199</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 2 }}>
              <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 4, borderRadius: 2, marginRight: 4, justifyContent: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 6 }}>IFSC</Text>
              </View>
              <Text style={styles.bankTextItem}>IFSC Code : SUTB248014</Text>
            </View>
          </View>

          <View style={styles.signatureCard}>
            <View style={styles.cardHeader}>
              <PenIcon />
              <Text style={styles.cardTitle}>FOR, {(company.name || '').toUpperCase()}</Text>
            </View>
            <View style={styles.signatureLineWrapper}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>AUTHORIZED SIGNATURE</Text>
            </View>
          </View>
        </View>

        {/* --- PREPARED BY / CHECKED BY --- */}
        <View style={styles.prepCheckRow} wrap={false}>
          <View style={styles.prepCheckItem}>
            <Text style={styles.prepCheckLabel}>PREPARED BY</Text>
            <Text style={{ fontSize: 9, marginRight: 5 }}>:</Text>
            <View style={styles.prepCheckLine}></View>
          </View>
          <View style={styles.prepCheckDivider}></View>
          <View style={styles.prepCheckItem}>
            <Text style={styles.prepCheckLabel}>CHECKED BY</Text>
            <Text style={{ fontSize: 9, marginRight: 5 }}>:</Text>
            <View style={styles.prepCheckLine}></View>
          </View>
        </View>

        {/* --- TERMS & CONDITIONS --- */}
        <View style={styles.termsCard} wrap={false}>
          <View style={styles.termsLeft}>
            <View style={styles.cardHeader}>
              <DocIcon />
              <Text style={styles.cardTitle}>TERMS & CONDITIONS</Text>
            </View>
            <View style={styles.termItem}><Text style={styles.termBullet}>•</Text><Text style={styles.termText}>Payment to be made by A/c. payee&apos;s cheque only.</Text></View>
            <View style={styles.termItem}><Text style={styles.termBullet}>•</Text><Text style={styles.termText}>Any complaint for the goods should be made within 1 day after that no complaint will be entertained.</Text></View>
            <View style={styles.termItem}><Text style={styles.termBullet}>•</Text><Text style={styles.termText}>Interest @24% per annum will be charged after due date of the bill.</Text></View>
            <View style={styles.termItem}><Text style={styles.termBullet}>•</Text><Text style={styles.termText}>We are not responsible for any loss or damage during transit.</Text></View>
            <View style={styles.termItem}><Text style={styles.termBullet}>•</Text><Text style={styles.termText}>We reserve the right of recovery before due date at any time.</Text></View>
            <View style={styles.termItem}><Text style={styles.termBullet}>•</Text><Text style={styles.termText}>Disputes will be settled in SURAT Courts only.</Text></View>
            <View style={styles.termItem}><Text style={styles.termBullet}>•</Text><Text style={styles.termText}>Personally selected goods will not be taken back.</Text></View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
