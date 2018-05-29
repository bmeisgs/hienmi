/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const g = 9.81;
function get_b(h,v,d,alpha){
let b = g*h-0.5*v*v/d*g+Math.cos(alpha);
return b;
};
console.log(get_b(1,1,1,1));

