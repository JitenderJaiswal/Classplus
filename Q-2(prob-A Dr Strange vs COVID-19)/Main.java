import java.util.*;
public class Main{
    static int mintime=Integer.MAX_VALUE;
    static int timestamp=0;
    public static void dfs(int edges[][],int currV,int[][] demonstimestamps){
        //condition when spiderman is at first or last universe
       if(edges.length-1==currV||currV==0){
           for(int j=0;j<demonstimestamps[currV].length;j++){
               if((j==0 && timestamp<demonstimestamps[currV][j])||(timestamp==demonstimestamps[currV][j] &&j+1==demonstimestamps[currV].length))
                    break;
               else if(timestamp==demonstimestamps[currV][j]&&j+1<demonstimestamps[currV].length){
                   timestamp+=demonstimestamps[currV][j+1]-demonstimestamps[currV][j];
                   break;
               }
           }
              if(timestamp>0)
              mintime=Math.min(mintime,timestamp);
              timestamp=0;
              return;
              
        }
       for(int i=0;i<edges.length;i++){
        //condition when spiderman is at except first and last universe
         if(edges[currV][i]!=0){
            timestamp+=edges[currV][i];
           for(int j=0;j<demonstimestamps[i].length;j++){
               if((j==0 && timestamp<demonstimestamps[i][j])||(timestamp==demonstimestamps[i][j] && j+1==demonstimestamps[i].length))
                    break;
               else if(timestamp==demonstimestamps[i][j]&&j+1<demonstimestamps[i].length){
                   timestamp+=demonstimestamps[i][j+1]-demonstimestamps[i][j];
                   break;
               }
           }
            if(i!=0)
            dfs(edges,i,demonstimestamps);
         }
       }
    }
    public static void dfs(int edges[][],int[][] demonstimestamps){
     dfs(edges,0,demonstimestamps);//Start from universe 1
    }
	public static void main(String[] args) {
		 Scanner s=new Scanner(System.in);
         int NUM_UNIVERSE=s.nextInt();
         int NUM_PORTAL=s.nextInt();
         int edges[][]=new int[NUM_UNIVERSE][NUM_UNIVERSE];
         int demonstimestamps[][]=new int[NUM_UNIVERSE][];//jagged array
         int NUM_DEMONS;
         
         for(int i=0;i<NUM_PORTAL;i++){
          int v1=s.nextInt();
          int v2=s.nextInt();
          edges[v1-1][v2-1]=s.nextInt();
        } 
        for(int i=0;i<NUM_UNIVERSE;i++){
             NUM_DEMONS=s.nextInt();
           demonstimestamps[i]=new int[NUM_DEMONS];
           for(int j=0;j<NUM_DEMONS;j++)
            demonstimestamps[i][j]=s.nextInt();
        }
        dfs(edges,demonstimestamps);
        if(mintime==Integer.MAX_VALUE)
        System.out.println("Total Time: -1");
        else
        System.out.println("Total Time: "+mintime);
	}
}



