import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Message from "../Message/Message";
import FeedbackMessage from "../FeeadbackMessage/FeedbackMessage";
import BadFeedbackRegistrationMessage from "../BadFeedbackRegistrationMessage/BadFeedbackRegistrationMessage";
import Header from "../../Header/Header";
import Sidebar from "../../Sidebar/Sidebar";
import { useTranslation } from "react-i18next";
import { ChatContext } from "../../../context/ChatContext";
import "./MessageList.css";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import chatI18n from "../../../i18n";

const exactIconStyles = `
   .str0 {stroke:#373435;stroke-width:20;stroke-miterlimit:22.9256}
   .fil4 {fill:#FEFEFE}
   .fil7 {fill:#FEFEFE}
   .fil0 {fill:#0068BF}
   .fil2 {fill:#0068BF}
   .fil1 {fill:#3C4353}
   .fil5 {fill:#3C4353}
   .fil6 {fill:#ACBBCA}
   .fil3 {fill:#ACBBCA}
`;

function ExactIcon({ viewBox, children }) {
   return (
      <svg
         width="36"
         height="36"
         viewBox={viewBox}
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         aria-hidden="true"
      >
         <defs>
            <style>{exactIconStyles}</style>
         </defs>
         {children}
      </svg>
   );
}

function FormsIcon() {
   return (
      <ExactIcon viewBox="75000 40000 18000 21000">
         <g>
            <path className="fil4" d="M87484.67 59905.01c130.6,-950.42 -263.28,-2919.02 282.93,-3527.82 524.36,-584.42 2627.94,-148.25 3538.93,-324.68l12.92 -11792.43c-98.27,-1155.69 -1407.77,-915.4 -3115.54,-868.5 -249.55,119.33 -299.01,248.07 -603.34,340.34 -404.52,122.63 -3913.14,61.3 -4584.75,64.28 -983.03,4.36 -808.57,-112.03 -1411.34,-406.54 -3858.83,-82.07 -3243.56,-281.14 -3243.56,3935.21l-0.03 10750.93c-1.33,1795.6 67.7,1830.55 1843.65,1829.94 2426.2,-0.84 4854.22,9.75 7280.13,-0.73z"/>
            <path className="fil5" d="M90685.87 42106.94l-2210.9 0.96c-11.88,769.31 -27.85,663.94 -271.06,1283.68 1707.77,-46.9 3017.27,-287.19 3115.54,868.5l-12.92 11792.43c-265.37,458.35 -1448.04,1519.75 -1894.92,1967.9 -412.47,413.64 -1542.13,1649.69 -1926.94,1884.6 -2425.91,10.48 -4853.93,-0.11 -7280.13,0.73 -1775.95,0.61 -1844.98,-34.34 -1843.65,-1829.94l0.03 -10750.93c0,-4216.35 -615.27,-4017.28 3243.56,-3935.21 -209.63,-577.6 -251.54,-512.19 -276.39,-1291.06 -3350.29,-229.46 -4265.72,199.23 -4265.13,3158.79 0.49,2508.54 0,5017.09 0,7525.64 0,1353.16 -200.65,6361.89 224.11,7219.25 439.68,887.43 1219.26,1198.75 2503.69,1195.67 1443.54,-3.49 10544.93,89.04 11171.28,-59.09 881.51,-208.45 1599.36,-964.02 1648.78,-2066.08 54.78,-1221.44 2.58,-2572.94 2.58,-3808.75 0,-1397 78.6,-10314.93 -15.8,-11250.87 -99.4,-985.45 -884.13,-1802.37 -1911.73,-1906.22z"/>
            <path className="fil2" d="M81328.09 42098.6c24.85,778.87 66.76,713.46 276.39,1291.06 602.77,294.51 428.31,410.9 1411.34,406.54 671.61,-2.98 4180.23,58.35 4584.75,-64.28 304.33,-92.27 353.79,-221.01 603.34,-340.34 243.21,-619.74 259.18,-514.37 271.06,-1283.68l2210.9 -0.96c-528.88,-157.3 -1710.5,113.44 -2182.65,-85.77 -384.36,-162.16 -84.35,-312.66 -850.68,-316.95 -420.79,-2.36 -842.54,6.38 -1264.57,2.18 -438.4,-2062.76 -2677.2,-1890.81 -2953.79,1.79 -1301.92,-1.88 -1710.03,-181.94 -2106.09,390.41z"/>
            <path className="fil6" d="M87484.67 59905.01c384.81,-234.91 1514.47,-1470.96 1926.94,-1884.6 446.88,-448.15 1629.55,-1509.55 1894.92,-1967.9 -910.99,176.43 -3014.57,-259.74 -3538.93,324.68 -546.21,608.8 -152.33,2577.4 -282.93,3527.82z"/>
            <path className="fil5" d="M80401.74 51436.33c247.11,148.23 522.11,110.16 877.89,110.16l7442.96 0c504.27,0 760.45,97.4 682.08,-440.39 -529.26,-163 -6664.6,-40.91 -8209.76,-68.03 -476.81,-8.37 -840.87,-118.88 -793.17,398.26z"/>
            <path className="fil5" d="M88639.89 53256.96l-7360.26 0c-230.53,0 -1314.34,-48.88 -828,418.17 194.05,186.36 6626.57,82.4 7361.28,82.33 270.17,-0.03 1276.09,43.79 1456.5,-33.38 94.75,-40.56 596.77,-467.12 -629.52,-467.12z"/>
            <path className="fil5" d="M80948.84 49337.04l7691.05 -0.79c1087.94,0 1078.44,-504.11 165.41,-504.11l-7525.67 0.28c-272.77,0 -726.08,-68.68 -856.67,133.11 -225.1,347.74 268.08,371.51 525.88,371.51z"/>
            <path className="fil5" d="M80382.07 46996.16c386.07,242.81 3820.55,124.31 4784.45,124.73 351.15,0.17 1501.49,164.87 1308.77,-340.85 -117.28,-307.77 -2705.77,-161.96 -3128.15,-161.96l-2487.15 -8.18c-415.73,4.75 -466.24,-19.18 -477.92,386.26z"/>
            <path className="fil5" d="M81279.63 55958.3l3142.6 0c296.66,0 681.19,90.63 645.11,-266.52 -27.97,-276.71 -328.8,-230.11 -639.18,-225.7l-3647.78 -1.5c-253.64,12.56 -592.41,107.2 -345.54,388.02 158.33,180.11 546.86,105.7 844.79,105.7z"/>
         </g>
      </ExactIcon>
   );
}

function StatsSearchIcon() {
   return (
      <ExactIcon viewBox="102000 39000 25000 22000">
         <g>
            <path className="fil0" d="M108964.05 39887.78c-3743.74,231.51 -6725.02,3348.7 -6467.41,7359.72 239.78,3733.56 3342.34,6677.6 7373.36,6444.35 3666.38,-212.15 6722.05,-3404.59 6439.25,-7388 -258.93,-3647.43 -3356.12,-6662.78 -7345.2,-6416.07zm-40 1572.61c-2789.06,260.37 -5129.41,2675.84 -4863.83,5787.03 243.88,2857.09 2687.77,5103.03 5807.3,4885.74 2721.02,-189.53 5142.39,-2760.05 4847.86,-5814.22 -200.71,-2081.26 -1516.84,-3818.95 -3452.24,-4541 -707.07,-263.79 -1523.46,-393.69 -2339.09,-317.55z"/>
            <path className="fil1" d="M113836.91 53291.53c75.65,113.23 108.79,142.42 213.04,253.65l2647.88 3043.81c606.04,639.36 1930.38,2278.63 2470.6,2787.7 762.29,718.34 2032.87,622.73 2730.14,-60.72 725.39,-711.02 795.08,-1948.72 59.87,-2728.46l-6084.66 -5337.15 -942.44 1098.38c-181.51,187.45 -350.26,324.65 -532.9,487.43 -169.65,151.21 -442.13,309.7 -561.53,455.36z"/>
            <path className="fil2" d="M111614.31 43909.12c60.7,188.96 143.34,186.97 219.72,370.21 -549.96,389.64 -2541.09,2206.48 -3232.62,2760.49 -193.08,154.69 -335.19,297.08 -526.77,454.74 -133.76,110.07 -437.67,397.34 -560.65,461.76 -248.14,-180.85 -1273.05,-1521.82 -1609.16,-1842.18 -129.89,55.4 -461.76,347.15 -568.33,447.3 -193.24,181.59 -381.77,331.91 -568.59,482.7 6.47,205.12 42.58,611.14 116.48,783.85 207.88,-66.98 662.41,-613.32 941.95,-742.16 289.85,302.47 527.32,633.32 804.45,927.43 289.13,306.82 505,630.55 804.71,914.84 139.08,-66.09 452.35,-368.4 599.22,-492.74l4267.51 -3649.01c92.67,71.61 67.67,58.31 128.2,133.17l146.54 141.3c105.59,-155.88 459.11,-1197.28 510.04,-1423.27l-1472.7 271.57z"/>
            <path className="fil3" d="M110965.85 46418.39c-55.14,1055.8 -8.4,3574.52 -8.57,4725.58 417.02,-72.47 827.37,-365.91 1102.34,-558.94 0.06,-1576.72 33.21,-3521.62 -4.34,-5053.67 -221.93,104.15 -873.2,770.69 -1089.43,887.03z"/>
            <path className="fil3" d="M109003.13 48103.47c-37.66,580.18 -18.87,2479.64 -6.75,3318.24 211.68,7.52 744.8,19.51 952.89,-18.88 148.31,-27.35 143.19,-35.43 143.18,-191.43 -0.03,-1237.37 26.65,-2789.35 -3.68,-3988.67 -208.77,84.03 -858.87,766.16 -1085.64,880.74z"/>
            <path className="fil3" d="M107396.25 49491.82c-122.8,-90.84 -228.97,-268.66 -355.23,-366.56l-3.71 1615.16c95.03,193.56 834.58,484.24 1092.54,502.05l1.94 -2343.54c-258.37,131.8 -500.65,467.54 -735.54,592.89z"/>
            <path className="fil3" d="M105070.66 48267.81c2.02,612.44 852.25,1706.37 1095.24,1839.19l2.74 -1878.45c0.64,-209.47 -196.27,-408.61 -381.55,-586.27 -120.72,47.82 -657.22,498.93 -716.43,625.53z"/>
         </g>
      </ExactIcon>
   );
}

function OkedSearchIcon() {
   return (
      <ExactIcon viewBox="48000 40000 22000 22000">
         <g>
            <path className="fil5" d="M50877.2 45674.67c-40.97,352.73 27.64,372.78 379.59,389.1l3945.52 -8.06c955.09,0.65 1230.83,145.03 1180.82,-381.04 -317.84,-228.31 -5181.01,-232.7 -5505.93,0z"/>
            <path className="fil5" d="M55990.73 56731.41c-113.09,-171.47 -120.46,-163.79 -273.4,-312.15 -144.97,-140.62 -182.43,-174.64 -298.02,-255.88 -133.72,89.19 -321.55,74.39 -526.45,74.07l-3156.47 -4.06c-525.34,-4.84 -912.1,-148.59 -860.17,387.87 384.48,272.04 4359.08,129.81 5114.51,110.15z"/>
            <path className="fil5" d="M55011.01 48795.13c191.5,-149.89 414.35,-417.5 537.11,-586.42 -900.78,51.48 -4147.57,-116.18 -4656.48,84.2l-34.55 370.35c749.38,270.2 3679.57,-143.23 4153.92,131.87z"/>
            <path className="fil5" d="M53915.46 51611.58l175.06 -742.12c-735.96,58.24 -2729.57,-89.59 -3202.11,97.28l-19.14 365.97c430.8,166.92 2369.97,72.31 2994.22,68.69l51.97 210.18z"/>
            <path className="fil5" d="M54270.79 54161.63l-257.64 -751.35c36.25,192.97 120.84,163.1 -618.56,154.19 -558.65,-6.74 -2166.06,-56.88 -2512.73,74.43l-8.57 365.39c792.27,284.83 2751.41,-187.52 3397.5,157.34z"/>
            <path className="fil5 str0" d="M58705.72 40714.53l-9237.65 0c-629.86,0 -1145.21,515.35 -1145.21,1145.22l0 17709.56c0,629.88 515.34,1145.22 1145.21,1145.22l13380.27 0c629.88,0 1145.22,-515.34 1145.22,-1145.22l0 -13410.59c-345.96,21.84 -783.64,12.91 -1183.79,-1.08l0 12983.69c0,149.77 -122.55,272.32 -272.32,272.32l-12758.49 0c-149.78,0 -272.31,-122.54 -272.31,-272.32l0 -16853.6c0,-149.78 122.53,-272.32 272.31,-272.32l8961.59 0c2.35,-405.1 -59.71,-940.01 -34.83,-1300.88z"/>
            <path className="fil5" d="M63917.21 45272.6l-4349.75 -4403.44c-166.42,-6.34 -193.41,162.02 -185.82,373.52 31.52,879.77 -92.29,2832.81 129.92,3490.87 199.13,589.61 737.8,613.32 2148.45,613.34 479.78,0 1979.34,123.87 2257.2,-74.29z"/>
            <g>
               <path className="fil2" d="M59378.49 58001.38c3410.38,163.67 6273.16,-2743.08 6051.37,-6181.83 -180.46,-2798.62 -2650.95,-5242.45 -5500.73,-5347.33 -7596.73,-279.51 -8008.5,11171.2 -550.64,11529.16z"/>
               <path className="fil7" d="M59226.45 47926.18c-2239.91,246.61 -4144.09,2228.94 -3851.81,4827.92 246.17,2188.72 2303.66,4116.49 4850.54,3790.17 2211.71,-283.38 4075.82,-2290.45 3768.38,-4851.86 -263.8,-2198.02 -2286.92,-4039.29 -4767.11,-3766.23z"/>
               <path className="fil5" d="M63770.55 57646.18c-29.72,177.14 -50.52,193.15 58.62,347.02 48.95,69.05 100.61,100.08 155.1,161.18 146.29,163.99 44.16,13.86 152.92,194.97 886.74,563.52 1878.8,2270.11 2730.15,2340.14 552.53,45.45 911.12,-236.7 1116.72,-580.48 613.81,-1026.44 -860.58,-2041.98 -1873.09,-3055.92 -222.41,-222.7 -569.36,-738.46 -946.67,-739.8 -14.22,15.47 -34.49,34.84 -44.43,44.67 -9.82,9.71 -31.9,32.3 -43.91,44.06 -11.74,11.48 -30.4,30.12 -43.28,42.57l-1262.13 1201.59z"/>
               <path className="fil4" d="M63068.87 56935.35l701.68 710.83 1262.13 -1201.59c12.88,-12.45 31.54,-31.09 43.28,-42.57 12.01,-11.76 34.09,-34.35 43.91,-44.06 9.94,-9.83 30.21,-29.2 44.43,-44.67 -308.29,-82.91 -237.41,-89.54 -453.28,-304.77 -198.3,-197.65 -290.01,-188.3 -266.41,-463.99 -292.69,206.29 -433.55,541.01 -657.74,762.77 -228.67,226.16 -470.59,392.85 -718,628.05z"/>
            </g>
         </g>
      </ExactIcon>
   );
}

function SupportIcon() {
   return (
      <ExactIcon viewBox="133000 40000 22000 22000">
         <g>
            <path className="fil3" d="M137854.49 57157.13c145.8,-42.47 2968.94,-2336.48 3430.97,-2705.6 1001.51,-800.11 1355.33,-905.92 2795.02,-905.9 749.73,0 1657.67,105.46 2189.16,-274.79 583.56,-417.5 716.67,-808.47 716.71,-1769.4 0.02,-817.74 0,-1635.38 0,-2453.09 0,-933.11 93.32,-1452.26 -470.82,-2015.71 -558.67,-557.98 -1040.3,-491.22 -1983.16,-482.96l-4906.18 -1.52c-821.16,-3.68 -1321.18,339.88 -1602.01,898.91 -276.55,550.5 -172.38,1590.87 -172.36,2279.11l2.67 7430.95z"/>
            <path className="fil2" d="M137583.84 40333.6c-75.9,286.69 -37.16,891.04 -32.54,1226.21 94.97,925.87 763.74,1621.27 1653.05,1746.21 381.89,53.65 2836.13,21.3 3423.64,21.3 750.4,0 2734.57,86.4 3319.61,-90.79 428.71,-129.85 799.76,-439.02 991.76,-723.49 302.76,-448.57 352.53,-740.75 356.45,-1366.43l-20.1 -780.73c-453.45,-422.36 -1346.79,-833.65 -2066.19,-1097.82 -811.26,-297.9 -1785.73,-470.93 -2742.87,-474.79 -1941.96,-7.81 -3674.08,651.48 -4882.81,1540.33z"/>
            <path className="fil5" d="M145289.52 56680.38c26.65,262.61 33.25,831.94 -3.12,1097.06 2545.67,8.04 4063.14,57.28 4902.04,-696 758.49,-681.07 962.32,-2033.13 869.92,-4395.77l-1198.55 0.02c17.48,11.86 -27.79,28.73 101.14,59.66 165.59,4451.58 -371.64,3811.79 -4671.43,3935.03z"/>
            <path className="fil5" d="M134010.08 47177.99l1065.12 38.58c-123.84,-362.43 119.69,-1639.17 220.1,-2015.51 333.62,-1250.46 1077.01,-2406.85 2020.83,-3298.86 96.88,-91.55 226.69,-149.76 234.46,-239.57 25.42,-293.57 -35.73,-673.15 33.25,-1329.03 -916.19,556.02 -1933.54,1781.54 -2465.42,2722.59 -493.84,873.75 -834.67,1860.19 -993.06,2878.75 -54.31,349.28 -44.07,964.81 -115.28,1243.05z"/>
            <path className="fil5" d="M147237.48 41862.77c1173.79,717.91 1926.06,2047.14 2291.69,3400.64 100.03,370.32 403.77,1636.86 274.42,2012.22l1038.35 -92.22c-53.76,-129.11 -83.96,-949.91 -117.55,-1199.79 -256.98,-1911.44 -1290.63,-3810.69 -2701.54,-5041.6 -149.67,-130.58 -547.79,-501.09 -747.14,-576.14l-38.23 1496.89z"/>
            <path className="fil4" d="M139981.25 49273.39l5132.11 0c237.74,0 406.66,-74.93 397.75,-320.96 -9.58,-264.5 -199.6,-293.67 -462.3,-293.67l-5293.51 0c-256.41,0 -513.77,89.15 -428.38,397.42 75.44,272.36 380.7,217.21 654.33,217.21z"/>
            <path className="fil4" d="M139503.87 50851.37c-268.87,132.11 -320.56,578.52 282.36,574.98 575.48,-3.38 3450.3,38.77 3602.62,-37.2 260.27,-129.8 251.6,-575.31 -275.58,-575.97 -563.07,-0.71 -3463.39,-33.56 -3609.4,38.19z"/>
            <path className="fil4" d="M145086.96 50851.82c-170.65,82.34 -228.59,231.83 -154.18,406.27 54.75,128.37 245.61,216.26 420.17,132.58 316.56,-151.76 102.59,-716.68 -265.99,-538.85z"/>
            <path className="fil2" d="M134818.03 47058.43l-676.31 -2.26c-436.15,113.5 -917.04,260.89 -960.63,966.5 -25.38,410.86 -29.51,3734.47 24.4,3968.95 61.19,266.14 242.31,485.74 402.09,600.62 370.39,266.31 1294.11,267.48 1680.94,32.47 191.78,-116.52 361.05,-333.03 433.64,-569.46 91.82,-299.08 44.79,-1559.73 44.79,-1966.73 0,-657.64 20.59,-1348.95 -0.3,-2002.31 -19.22,-601.03 -404.03,-938.47 -948.62,-1027.78z"/>
            <path className="fil2" d="M149960.95 52772.45l837.11 -0.02c478.65,-100.24 841.84,-433.19 871.23,-972.75l-2.58 -3803.52c-46.37,-528 -434.77,-877.66 -948.07,-934.57l-686.89 -1.95c-1268.72,188.99 -946.88,1534.47 -946.88,2802.93 0,626.67 -19.02,1283 0.22,1905.93 17.55,568.31 385.96,897.07 875.86,1003.95z"/>
            <path className="fil2" d="M145506.5 57499.32c36.37,-265.12 29.77,-347.75 3.12,-610.36 -532.26,-2020.33 -3163.46,-1496.16 -3169.59,293.16 -2.9,845.19 630.75,1521.03 1412.65,1601.02 957.84,97.99 1570.5,-534.37 1753.82,-1283.82z"/>
         </g>
      </ExactIcon>
   );
}

function getDirectionIcon(text, index) {
   if (index === 0) {
      return <FormsIcon />;
   }

   if (index === 1) {
      return <StatsSearchIcon />;
   }

   if (index === 2) {
      return <OkedSearchIcon />;
   }

   if (index === 3) {
      return <SupportIcon />;
   }

   const normalizedText = String(text || "").toLocaleLowerCase();

   if (
      normalizedText.includes("форм") ||
      normalizedText.includes("нысан") ||
      normalizedText.includes("submit")
   ) {
      return <FormsIcon />;
   }

   if (
      normalizedText.includes("окэд") ||
      normalizedText.includes("эсжжә") ||
      normalizedText.includes("oked")
   ) {
      return <OkedSearchIcon />;
   }

   if (
      normalizedText.includes("поддерж") ||
      normalizedText.includes("қолдау") ||
      normalizedText.includes("support")
   ) {
      return <SupportIcon />;
   }

   return <StatsSearchIcon />;
}

export default function MessageList({ isSidebarOpen, toggleSidebar }) {
   const { t } = useTranslation(undefined, { i18n: chatI18n });
   const {
      chats,
      currentChatId,
      getBotMessageIndex,
      isTyping,
      handleButtonClick,
      showInitialButtons,
      chatSearchFocus,
      clearChatSearchFocus,
   } = useContext(ChatContext);

   const currentChat = useMemo(
      () =>
         chats.find(
            (chat) =>
               (currentChatId === null && chat.id === null) ||
               chat.id === currentChatId,
         ),
      [chats, currentChatId],
   );

   const messages = useMemo(() => currentChat?.messages || [], [currentChat]);

   const scrollTargetRef = useRef(null);
   useEffect(() => {
      if (scrollTargetRef.current) {
         scrollTargetRef.current.scrollIntoView({ behavior: "smooth" });
      }
   }, [messages]);

   useEffect(() => {
      if (!chatSearchFocus) return;
      if (String(chatSearchFocus.chatId) !== String(currentChatId)) return;

      const targetId = `chat-message-${String(currentChatId)}-${chatSearchFocus.renderedMessageIndex}`;
      const targetNode = document.getElementById(targetId);

      if (!targetNode) return;

      targetNode.scrollIntoView({ behavior: "smooth", block: "center" });
      targetNode.classList.remove("message--search-hit");
      void targetNode.offsetWidth;
      targetNode.classList.add("message--search-hit");

      const timeoutId = window.setTimeout(() => {
         targetNode.classList.remove("message--search-hit");
         clearChatSearchFocus();
      }, 2200);

      return () => window.clearTimeout(timeoutId);
   }, [messages, currentChatId, chatSearchFocus, clearChatSearchFocus]);

   const useWindowWidth = () => {
      const [windowWidth, setWindowWidth] = useState(window.innerWidth);
      useEffect(() => {
         const handleResize = () => setWindowWidth(window.innerWidth);
         window.addEventListener("resize", handleResize);
         return () => window.removeEventListener("resize", handleResize);
      }, []);
      return windowWidth;
   };

   const windowWidth = useWindowWidth();

   const initialDirectionButtons = useMemo(
      () =>
         showInitialButtons
            ? messages.filter(
                 (message, index) =>
                    index > 0 &&
                    message.isButton &&
                    !message.isSubcategory &&
                    !message.isReport &&
                    !message.isFaq,
              )
            : [],
      [messages, showInitialButtons],
   );

   const showInitialDirections =
      Boolean(currentChat?.isEmpty) && initialDirectionButtons.length > 0;

   let botCount = 0;
   const renderedMessages = messages.map((message, index) => {
      if (
         showInitialButtons &&
         index > 0 &&
         message.isButton &&
         !message.isSubcategory &&
         !message.isReport &&
         !message.isFaq
      ) {
         return null;
      }

      if (message.isGreeting && currentChat.isEmpty) {
         return null;
      }

      if (message.isFeedback) {
         const botMessageIndex = getBotMessageIndex(index);
         return (
            <FeedbackMessage
               key={index}
               text={message.text}
               messageIndex={botMessageIndex}
            />
         );
      }

      if (message.badFeedbackPrompt) {
         return (
            <BadFeedbackRegistrationMessage
               key={index}
               currentChatId={currentChatId}
            />
         );
      }

      let feedbackIndex;
      if (!message.isUser && !message.isGreeting) {
         botCount += 1;
         feedbackIndex = botCount * 2 - 1;
      }

      return (
         <Message
            key={index}
            text={message.text}
            isUser={message.isUser}
            isButton={message.isButton}
            onClick={
               message.isButton ? () => handleButtonClick(message) : undefined
            }
            filePath={message.filePath}
            filePaths={message.filePaths}
            isGreeting={message.isGreeting}
            botMessageIndex={feedbackIndex}
            isHtml={!message.isUser}
            isCustomMessage={message.isCustomMessage}
            isAssistantResponse={message.isAssistantResponse || false}
            streaming={message.streaming || false}
            attachments={message.attachments}
            runnerBin={message.runnerBin}
            messageDomId={`chat-message-${String(currentChatId)}-${index}`}
         >
            {index === 0 &&
               messages.some((msg) => msg.isButton && msg.isSubcategory) && (
                  <div className="suggestion-text mt-4">
                     {t("chat.interestingSuggestion")}
                  </div>
               )}
            {index === 0 &&
               messages.some((msg) => msg.isButton && msg.isReport) && (
                  <div className="suggestion-text mt-4">
                     {t("chat.interestingSuggestion")}
                  </div>
               )}
            {index === 0 &&
               messages.some((msg) => msg.isButton && msg.isFaq) && (
                  <div className="suggestion-text mt-4">
                     {t("chat.interestingSuggestion")}
                  </div>
               )}
         </Message>
      );
   });

   return (
      <div className="relative">
         <Header
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
         />
         {windowWidth < 700 && (
            <Sidebar
               isSidebarOpen={isSidebarOpen}
               toggleSidebar={toggleSidebar}
            />
         )}
         <div className="overflow-y-auto message-list-wrap">
            <div className="message-list justify-end flex flex-col">
               {showInitialDirections && (
                  <div className="message-list__directions message-list__directions--standalone">
                     <div className="direction-cards" role="list">
                        {initialDirectionButtons.map((button, buttonIndex) => (
                           <button
                              key={`${button.text}-${buttonIndex}`}
                              type="button"
                              className="direction-card"
                              onClick={() => handleButtonClick(button)}
                           >
                              <span className="direction-card__icon">
                                 {getDirectionIcon(button.text, buttonIndex)}
                              </span>
                              <span className="direction-card__label">
                                 {button.text}
                              </span>
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {renderedMessages}
               {isTyping && (
                  <TypingIndicator text={t("chatTyping.typingMessage")} />
               )}
               <div ref={scrollTargetRef}></div>
            </div>
         </div>
      </div>
   );
}
